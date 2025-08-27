const Story = require("../models/story.model");
const AdminStory = require('../models/admin.story.model');
const { successResponse, errorResponse } = require("../utils/response.util");
const { deleteFromCloudinary } = require('../utils/cloudinary.util');

// ✅ Create a new story
exports.createStory = async (req, res, next) => {
    try {
        const { title, caption } = req.body;
        if (!title) {
            return errorResponse(res, 400, "All fields are required");
        }

        const story = await Story.create({
            title,
            caption,
            createdBy: req.user.id,
        });

        successResponse(res, "Story created successfully", story);
    } catch (error) {
        next(error);
    }
};

// ✅ Get all stories (only active)
exports.getStories = async (req, res, next) => {
    try {
        // Fetch both stories in parallel
        const [userStories, adminStories] = await Promise.all([
            Story.find()
                .select('title caption imageUrl createdBy isExpired expiredTime')
                .sort({ createdAt: -1 }).populate("createdBy", "name email"),
            AdminStory.find()
                .select('title caption imageUrl createdBy isExpired expiredTime')
                .sort({ createdAt: -1 }).populate("createdBy", "name email")
        ]);

        // Merge and sort by createdAt (latest first)
        const combinedStories = [...userStories, ...adminStories].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        successResponse(res, "All stories fetched", combinedStories);
    } catch (error) {
        next(error);
    }
};

// ✅ Get a single story by ID
exports.getStoryById = async (req, res, next) => {
    try {
        const story = await Story.findById(req.params.id)
            .select('title caption imageUrl createdBy isExpired expiredTime')
            .populate('createdBy', 'name email');

        if (!story) return errorResponse(res, 404, "Story not found");

        successResponse(res, "Story fetched successfully", story);
    } catch (error) {
        next(error);
    }
};

// ✅ Update a story
exports.updateStory = async (req, res, next) => {
    try {
        const { title, caption } = req.body;
        let story = await Story.findById(req.params.id);
        if (!story) return errorResponse(res, 404, "Story not found");

        if (story.createdBy.toString() !== req.user.id) {
            return errorResponse(res, 403, "Unauthorized: You can only update your own story");
        }

        story = await Story.findByIdAndUpdate(
            req.params.id,
            {
                title: title || story.title,
                caption: caption || story.caption,
            },
            { new: true }
        );

        successResponse(res, "Story updated successfully", story);
    } catch (error) {
        next(error);
    }
};

// ✅ Delete a story
exports.deleteStory = async (req, res, next) => {
    try {
        const story = await Story.findById(req.params.id);
        if (!story) return errorResponse(res, 404, "Story not found");

        if (story.createdBy.toString() !== req.user.id) {
            return errorResponse(res, 403, "Unauthorized: You can only delete your own story");
        }

        if (story.publicId) await deleteFromCloudinary(story.publicId);

        await story.deleteOne();
        successResponse(res, "Story deleted successfully");
    } catch (error) {
        next(error);
    }
};
