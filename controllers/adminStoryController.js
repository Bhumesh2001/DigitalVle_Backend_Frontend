const Story = require("../models/storyModel");
const AdminStory = require('../models/adminStoryModel');
const { uploadImageOnCloudinary, deleteImageFromCloudinary } = require("../utils/cloudinaryUtils");
const { successResponse, errorResponse } = require("../utils/responseHandler");

// Create Story
exports.createStory = async (req, res, next) => {
    try {
        const { title, caption, expiredTime } = req.body;
        const createdBy = req.user.id;

        let uploadedData = {};
        if (req.files && req.files.imageUrl) {
            uploadedData = await uploadImageOnCloudinary(req.files.imageUrl.tempFilePath, "VleStories");
        }

        const newStory = await AdminStory.create({
            title,
            caption,
            imageUrl: uploadedData.url,
            publicId: uploadedData.public_id,
            expiredTime,
            createdBy,
        });

        successResponse(res, "Story created successfully", newStory);
    } catch (err) {
        next(err);
    }
};

// Get All Stories
exports.getAllStories = async (req, res, next) => {
    try {
        // Fetch both stories in parallel
        const [userStories, adminStories] = await Promise.all([
            Story.find().sort({ createdAt: -1 }).populate("createdBy", "name email"),
            AdminStory.find().sort({ createdAt: -1 }).populate("createdBy", "name email")
        ]);

        // Merge and sort by createdAt (latest first)
        const combinedStories = [...userStories, ...adminStories].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        successResponse(res, "All stories fetched", combinedStories);
    } catch (err) {
        next(err);
    }
};

// Get Single Story
exports.getStory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.user;        

        const Model = role === "admin" ? AdminStory : Story;

        const story = await Model.findById(id).populate("createdBy", "name email");
        if (!story) return errorResponse(res, 404, "Story not found");

        successResponse(res, "Story fetched", story);
    } catch (err) {
        next(err);
    }
};

// Update Story
exports.updateStory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.user;
        const Model = role === "admin" ? AdminStory : Story;

        const story = await Model.findById(id);
        if (!story) return errorResponse(res, 404, "Story not found");

        // Restrict user from updating other's story
        if (role === "user" && role !== "admin" && String(story.createdBy) !== String(req.user.id)) {
            return errorResponse(res, 403, "You are not allowed to update this story");
        }

        // Handle image upload
        if (req.files?.imageUrl && story.publicId) {
            await deleteImageFromCloudinary(story.publicId);
        }

        if (req.files && req.files.imageUrl) {
            const uploadedData = await uploadImageOnCloudinary(req.files.imageUrl.tempFilePath, "VleStories");
            story.imageUrl = uploadedData.url;
            story.publicId = uploadedData.public_id;
        }

        story.title = req.body.title || story.title;
        story.caption = req.body.caption || story.caption;
        story.expiredTime = req.body.expiredTime || story.expiredTime;

        await story.save();
        successResponse(res, "Story updated", story);
    } catch (err) {
        next(err);
    }
};

// Delete Story
exports.deleteStory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.user;

        const Model = role === "admin" ? AdminStory : Story;

        const story = await Model.findById(id);
        if (!story) return errorResponse(res, 404, "Story not found");

        // If user trying to delete and it's not their story
        if (role === "User" && role !== "admin" && String(story.createdBy) !== String(req.user._id)) {
            return errorResponse(res, 403, "You are not allowed to delete this story");
        }

        // Delete image if available
        if (story.publicId) await deleteImageFromCloudinary(story.publicId);

        await story.deleteOne();
        successResponse(res, "Story deleted");
    } catch (err) {
        next(err);
    }
};

