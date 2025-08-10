const { OAuth2Client } = require('google-auth-library');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const setTokenCookie = require("../utils/setTokenCookie");
const sendEmail = require("../services/emailService");
const {
    registrationEmailTemplate,
    getOtpEmailTemplate,
    sendEmailOtp
} = require("../utils/emailTemplates");
const { successResponse, errorResponse } = require("../utils/responseHandler");
const { uploadImageOnCloudinary, deleteImageFromCloudinary } = require('../utils/cloudinaryUtils');

const client = new OAuth2Client(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.CALLBACK_URL
);

// Temporary storage for unverified users
const unverifiedUsers = new Map();

// Register User (without saving to DB until OTP verification)
exports.registerUser = async (req, res, next) => {
    try {
        const { name, email, password, mobileNumber } = req.body;

        // Check if user exists in DB or temporary storage
        const userExists = await User.findOne({ email }) || unverifiedUsers.get(email);
        if (userExists) {
            return errorResponse(res, 400, "Email already exists or pending verification");
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

        // Store user data temporarily
        const tempUser = {
            name,
            email,
            password,
            mobileNumber,
            otp,
            otpExpiry,
            attempts: 0,
            createdAt: Date.now()
        };

        unverifiedUsers.set(email, tempUser);

        // Send OTP Email
        await sendEmail(email, "Verify Your Email", sendEmailOtp(name, otp));

        return successResponse(res, "OTP sent to your email for verification", { email });
    } catch (error) {
        next(error);
    }
};

// Resend Email OTP
exports.resendEmailOtp = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return errorResponse(res, 400, "Email is required.");
        }

        const tempUser = unverifiedUsers.get(email);
        const dbUser = await User.findOne({ email });

        if (dbUser) {
            return errorResponse(res, 400, "Email already registered.");
        }

        if (!tempUser) {
            return errorResponse(res, 404, "No pending registration found for this email.");
        }

        // Prevent OTP flooding
        if (tempUser.attempts >= 3) {
            unverifiedUsers.delete(email);
            return errorResponse(res, 429, "Too many attempts. Please register again.");
        }

        // Generate new OTP
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();;
        const newOtpExpiry = Date.now() + 5 * 60 * 1000;

        // Update temp user
        tempUser.otp = newOtp;
        tempUser.otpExpiry = newOtpExpiry;
        tempUser.attempts += 1;
        unverifiedUsers.set(email, tempUser);

        // Send new OTP
        await sendEmail(email, "New OTP for Verification", sendEmailOtp(tempUser.name, newOtp));

        return successResponse(res, "New OTP sent successfully", { email });
    } catch (error) {
        next(error);
    }
};

// Verify Email OTP
exports.verifyEmailOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return errorResponse(res, 400, "Email and OTP are required.");
        }

        const tempUser = unverifiedUsers.get(email);
        if (!tempUser) {
            return errorResponse(res, 404, "No pending registration found or OTP expired.");
        }

        // Check OTP expiry
        if (tempUser.otpExpiry < Date.now()) {
            unverifiedUsers.delete(email);
            return errorResponse(res, 400, "OTP has expired. Please register again.");
        }

        // Verify OTP
        if (tempUser.otp !== otp.toString()) {
            tempUser.attempts += 1;

            // Remove after too many attempts
            if (tempUser.attempts >= 3) {
                unverifiedUsers.delete(email);
                return errorResponse(res, 400, "Too many failed attempts. Please register again.");
            }

            unverifiedUsers.set(email, tempUser);
            return errorResponse(res, 400, "Invalid OTP.");
        }

        // OTP verified - create actual user
        const { name, password, mobileNumber } = tempUser;
        const newUser = new User({
            name,
            email,
            password,
            mobileNumber,
            emailVerified: true
        });
        await newUser.save();

        // Clean up
        unverifiedUsers.delete(email);

        // Send welcome email
        await sendEmail(email, "Welcome to Our Platform!", registrationEmailTemplate(name));

        return successResponse(res, "Registration successful!", {
            userId: newUser._id,
            emailVerified: true
        });
    } catch (error) {
        next(error);
    }
};

// Cleanup expired temporary users (run this periodically)
function cleanupExpiredRegistrations() {
    const now = Date.now();
    for (const [email, user] of unverifiedUsers.entries()) {
        if (user.otpExpiry < now || (now - user.createdAt) > 24 * 60 * 60 * 1000) {
            unverifiedUsers.delete(email);
        }
    }
};

// Run cleanup every hour
setInterval(cleanupExpiredRegistrations, 1 * 60 * 1000);

// Login user
exports.loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user and explicitly select password
        const user = await User.findOne({ email }).select("+password");
        if (!user) return errorResponse(res, 400, "Invalid email or password");

        // ✅ Prevent Google users from logging in with password
        if (!user.password) {
            return errorResponse(res, 403, "You signed up with Google. Please log in using Google.");
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return errorResponse(res, 400, "Invalid email or password");

        // Generate JWT token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
        await user.save();

        // ✅ Store token in cookie using the reusable function
        setTokenCookie(res, token, 'token');

        successResponse(res, "Login successful", { token });
    } catch (error) {
        next(error);
    }
};

// Login with Google
exports.loginWithGoogle = async (req, res, next) => {
    try {
        const { googleId, email, name } = req.body;

        if (!googleId) {
            return errorResponse(res, 400, "Google ID is required.");
        }

        // 🛑 Check if email already exists without Google ID
        let existingUser = await User.findOne({ email });

        // If user exists with email but without googleId => block Google login
        if (existingUser && !existingUser.googleId) {
            return errorResponse(res, 400, "Account exists with this email. Please login using email and password.");
        }

        // ✅ Now find user by googleId
        let user = await User.findOne({ googleId });

        let isNewUser = false;

        // If not found, create new user with Google ID
        if (!user) {
            user = new User({
                googleId,
                email,
                name,
            });
            await user.save();
            await sendEmail(email, "Welcome to Our Platform!", registrationEmailTemplate(name));
            isNewUser = true;
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Set token in cookie
        setTokenCookie(res, token, 'token');

        successResponse(
            res,
            isNewUser ? "Signup successful via Google" : "Login successful via Google",
            { token }
        );
    } catch (error) {
        next(error);
    }
};

// Logout user
exports.logoutUser = async (req, res, next) => {
    try {
        // Ensure req.user exists before proceeding
        if (!req.user || !req.user.id) {
            return errorResponse(res, 401, "Unauthorized, no user found");
        }

        // Find the user
        const user = await User.findById(req.user.id);
        if (!user) return errorResponse(res, 400, "User not found");

        // Clear active token on logout
        user.activeToken = null;
        await user.save();

        // ✅ Clear cookie
        res.clearCookie("token");

        successResponse(res, "Logout successful");
    } catch (error) {
        next(error);
    }
};

// 🔹 Redirect User to Google Authentication
exports.redirectToGoogleProfile = async (req, res, next) => {
    try {
        const googleUrl = client.generateAuthUrl({
            access_type: "offline",
            scope: [
                "https://www.googleapis.com/auth/userinfo.profile",
                "https://www.googleapis.com/auth/userinfo.email",
            ],
        });

        successResponse(res, "Paste this URL into the browser for authentication", { googleUrl });
    } catch (error) {
        next(error);
    }
};

// 🔹 Handle Google Login & JWT Token Generation
exports.getGoogleProfile = async (req, res, next) => {
    const { code } = req.query;
    if (!code) return errorResponse(res, 400, "No authorization code provided");

    try {
        // ✅ Exchange code for Google tokens
        const { tokens } = await client.getToken(code);
        if (!tokens.id_token) return errorResponse(res, 400, "No ID token received");
        client.setCredentials(tokens);

        // ✅ Verify Google ID token
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload.email || !payload.sub) return errorResponse(res, 400, "Invalid Google profile data");

        const googleId = payload.sub;
        const email = payload.email;
        const name = payload.name || "Unnamed User";
        const profilePicture = payload.picture || null;

        // ✅ Check if user exists
        let user = await User.findOne({ email });
        let isNewUser = false;

        if (!user) {
            user = await User.create({ name, email, googleId, profilePicture });
            isNewUser = true;
        }

        // ✅ Generate JWT Token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
        await user.save();

        // ✅ Store token in cookie securely
        setTokenCookie(res, token, 'token');

        // ✅ Send welcome email only for new users
        if (isNewUser) {
            sendEmail(email, "Welcome to Our Platform!", registrationEmailTemplate(name));
        };

        successResponse(res, "Logged in successfully", { token });
    } catch (error) {
        next(error);
    }
};

// 🔹 Request Password Reset (Send OTP)
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) return errorResponse(res, 400, "Email is required");

        const user = await User.findOne({ email });
        if (!user) return errorResponse(res, 404, "User not found");

        // ✅ Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // ✅ Encrypt OTP before storing it
        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otp, salt);

        // ✅ Store OTP & Expiration in User Schema
        user.resetOtp = hashedOtp;
        user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes expiry
        await user.save();

        // ✅ Send OTP to Email
        sendEmail(email, "Password Reset OTP", getOtpEmailTemplate(otp));

        return successResponse(res, "OTP sent to your email");
    } catch (error) {
        next(error);
    }
};

// 🔹 Verify OTP (Separate API)
exports.verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return errorResponse(res, 400, "Email and OTP are required");

        const user = await User.findOne({ email }).select("+resetOtp +otpExpires");
        if (!user) return errorResponse(res, 404, "User not found");

        // ✅ Check if OTP is expired
        if (user.otpExpires < Date.now()) return errorResponse(res, 400, "OTP has expired");

        // ✅ Verify OTP
        const isOtpValid = await bcrypt.compare(otp, user.resetOtp);
        if (!isOtpValid) return errorResponse(res, 400, "Invalid OTP");

        // ✅ Mark OTP as verified (instead of deleting it immediately)
        user.otpVerified = true;
        await user.save();

        return successResponse(res, "OTP verified successfully");
    } catch (error) {
        next(error);
    }
};

// 🔹 Resend OTP API
exports.resendOTP = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) return errorResponse(res, 400, "Email is required");

        // ✅ Check if user exists
        const user = await User.findOne({ email });
        if (!user) return errorResponse(res, 404, "User not found");

        // ✅ Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // ✅ Encrypt OTP before storing it
        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otp, salt);

        user.resetOtp = hashedOtp;
        user.otpExpires = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes
        await user.save();

        // ✅ Send OTP via email
        sendEmail(email, "Password Reset OTP", getOtpEmailTemplate(otp));

        successResponse(res, "OTP resent successfully. Please check your email.");
    } catch (error) {
        next(error);
    }
};

// 🔹 Reset Password (Only if OTP is Verified)
exports.resetPassword = async (req, res, next) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) return errorResponse(res, 400, "Email and new password are required");

        const user = await User.findOne({ email }).select("+otpVerified");
        if (!user) return errorResponse(res, 404, "User not found");

        // ✅ Ensure OTP was verified
        if (!user.otpVerified) return errorResponse(res, 400, "OTP verification required before resetting password");
        user.password = newPassword;

        // ✅ Clear OTP fields
        user.resetOtp = null;
        user.otpExpires = null;
        user.otpVerified = null;
        await user.save();

        return successResponse(res, "Password reset successful");
    } catch (error) {
        next(error);
    }
};

// 🔹 Get User Profile
exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .select("name email mobileNumber status");
        if (!user) return errorResponse(res, 404, "User not found");

        successResponse(res, "Profile retrieved successfully", user);
    } catch (error) {
        next(error);
    }
};

// 🔹 Update User Profile
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, mobileNumber, dob } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) return errorResponse(res, 404, "User not found");

        // ✅ Update only the provided fields
        if (name) user.name = name;
        if (mobileNumber) user.mobileNumber = mobileNumber;
        if (dob) user.dob = dob;

        // 📸 Upload new profile picture if exists
        if (req.files && req.files.profileUrl) {
            if (user.profileUrl) await deleteImageFromCloudinary(user.publicId);

            const uploadedData = await uploadImageOnCloudinary(
                req.files.profileUrl.tempFilePath,
                'VleProfiles'
            );
            user.profileUrl = uploadedData.url;
            user.publicId = uploadedData.public_id;
        };

        await user.save();

        // ✅ Exclude `activeToken` from response
        const userResponse = user.toObject();
        delete userResponse.activeToken;

        successResponse(res, "Profile updated successfully", userResponse);
    } catch (error) {
        next(error);
    }
};
