const { OAuth2Client } = require('google-auth-library');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const setTokenCookie = require("../utils/setTokenCookie");
const sendEmail = require("../services/emailService");
const { registrationEmailTemplate, getOtpEmailTemplate } = require("../utils/emailTemplates");
const { successResponse, errorResponse } = require("../utils/responseHandler");
const { uploadImageOnCloudinary, deleteImageFromCloudinary } = require('../utils/cloudinaryUtils');

const client = new OAuth2Client(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.CALLBACK_URL
);

// Register User
exports.registerUser = async (req, res, next) => {
    try {
        const { name, email, password, mobileNumber } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) return errorResponse(res, 400, "Email already exists");

        const newUser = new User({ name, email, password, mobileNumber });
        await newUser.save();

        // Send Registration Email
        await sendEmail(email, "Welcome to Our Platform!", registrationEmailTemplate(name));

        successResponse(res, "User registered successfully", { userId: newUser._id });
    } catch (error) {
        next(error);
    }
};

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

        // Check if user is already logged in on another device
        if (user.activeToken) {
            return errorResponse(res, 403, "You are already logged in on another device.");
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return errorResponse(res, 400, "Invalid email or password");

        // Generate JWT token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

        // Store token in user document
        user.activeToken = token;
        await user.save();

        // ✅ Store token in cookie using the reusable function
        setTokenCookie(res, token, 'token');

        successResponse(res, "Login successful", { token });
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

        // Check if user is already logged out
        if (!user.activeToken) {
            res.clearCookie("token"); // Ensure cookie is removed
            return errorResponse(res, 401, "User already logged out!");
        }

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
        } else if (user.activeToken) {
            return errorResponse(res, 409, "User already logged in on another device");
        }

        // ✅ Generate JWT Token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

        // ✅ Store token in user document & Save
        user.activeToken = token;
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
            .select("-publicId -password -otp -otpExpires -activeToken -role");
        if (!user) return errorResponse(res, 404, "User not found");

        successResponse(res, "Profile retrieved successfully", user);
    } catch (error) {
        next(error);
    }
};

// 🔹 Update User Profile
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, mobileNumber } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) return errorResponse(res, 404, "User not found");

        // ✅ Update only the provided fields
        if (name) user.name = name;
        if (mobileNumber) user.mobileNumber = mobileNumber;

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
