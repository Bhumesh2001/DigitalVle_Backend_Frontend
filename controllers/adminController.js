const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");
const { successResponse, errorResponse } = require("../utils/responseHandler");
const { deleteImageFromCloudinary, uploadImageOnCloudinary } = require('../utils/cloudinaryUtils');
const setTokenCookie = require("../utils/setTokenCookie");

// ✅ Register Admin
exports.registerAdmin = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) return errorResponse(res, 400, "All fields are required!");

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) return errorResponse(res, 409, "Admin already exists!");

        const admin = await Admin.create({ name, email, password, role });
        successResponse(res, "Admin registered successfully", { adminId: admin._id });
    } catch (error) {
        next(error);
    }
};

// ✅ Login Admin
exports.loginAdmin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return errorResponse(res, 400, "Email and password are required!");

        const admin = await Admin.findOne({ email }).select("+password");
        if (!admin) return errorResponse(res, 401, "Invalid email or password");

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return errorResponse(res, 401, "Invalid email or password");
        
        // Generate JWT token
        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        await admin.save();

        // ✅ Store token in secure cookie
        setTokenCookie(res, token, 'token_');

        successResponse(res, "Admin logged in successfully", { token });
    } catch (error) {
        next(error);
    }
};

// ✅ Get Admin Profile
exports.getAdminProfile = async (req, res, next) => {
    try {
        const admin = await Admin.findById(req.user.id).select("name email profileUrl");
        if (!admin) return errorResponse(res, 404, "Admin not found");

        successResponse(res, "Admin profile fetched successfully", admin);
    } catch (error) {
        next(error);
    }
};

// ✅ Update Admin Profile
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, email } = req.body;
        const adminId = req.user.id; // Ensure admin is authenticated

        // Find admin by ID
        const admin = await Admin.findById(adminId);
        if (!admin) return errorResponse(res, 404, "Admin not found!");

        // Handle Profile Picture Upload
        let uploadedData = {};
        if (req.files && req.files.profileUrl) {
            if (admin.publicId) await deleteImageFromCloudinary(admin.publicId);
            uploadedData = await uploadImageOnCloudinary(req.files.profileUrl.tempFilePath, "VleProfiles");
        }

        // Update fields if provided
        if (name) admin.name = name;
        if (email) admin.email = email;
        if (uploadedData.url) admin.profileUrl = uploadedData.url;
        if (uploadedData.public_id) admin.publicId = uploadedData.public_id;

        await admin.save();

        successResponse(res, "Profile updated successfully!", admin);
    } catch (error) {
        next(error);
    }
};

// ✅ Logout Admin
exports.logoutAdmin = async (req, res, next) => {
    try {
        const admin = await Admin.findById(req.user.id);
        if (!admin) return errorResponse(res, 404, "Admin not found");

        // ✅ Clear token from cookie
        res.clearCookie("token_");

        successResponse(res, "Logged out successfully");
    } catch (error) {
        next(error);
    }
};
