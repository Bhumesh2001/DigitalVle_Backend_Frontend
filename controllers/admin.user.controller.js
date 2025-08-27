const User = require("../models/user.model");
const Article = require("../models/article.model");
const Story = require("../models/story.model");
const Like = require("../models/like.model");
const Comment = require("../models/comment.model");
const { successResponse, errorResponse } = require("../utils/response.util");

// ✅ Create User
exports.createUser = async (req, res, next) => {
    try {
        const user = new User(req.body);
        await user.save();
        successResponse(res, "User created successfully", user);
    } catch (error) {
        next(error);
    }
};

// ✅ Get All Users
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().select("name email mobileNumber status");
        successResponse(res, "Users fetched successfully", users);
    } catch (error) {
        next(error);
    }
};

// ✅ Get Single User
exports.getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select("name email mobileNumber status");
        if (!user) return errorResponse(res, "User not found", 404);
        successResponse(res, "User fetched successfully", user);
    } catch (error) {
        next(error);
    }
};

// ✅ Update User
exports.updateUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) return errorResponse(res, "User not found", 404);

        successResponse(res, "User updated successfully", user);
    } catch (error) {
        next(error);
    }
};

// ✅ Delete User & Related Data
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return errorResponse(res, "User not found", 404);

        // Cascade Delete
        await Promise.all([
            Article.deleteMany({ createdBy: user._id }),
            Story.deleteMany({ createdBy: user._id }),
            Like.deleteMany({ userId: user._id }),
            Comment.deleteMany({ userId: user._id }),
        ]);

        successResponse(res, "User and related data deleted successfully");
    } catch (error) {
        next(error);
    }
};
