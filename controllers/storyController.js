const Story = require("../models/storyModel");
const { successResponse, errorResponse } = require("../utils/responseHandler");
const { deleteImageFromCloudinary, uploadImageOnCloudinary } = require('../utils/cloudinaryUtils');

// ✅ Create a new story
exports.createStory = async (req, res, next) => {
    try {
        const { title, caption } = req.body;
        if (!title) {
            return errorResponse(res, 400, "All fields are required");
        }

        if (!req.files || !req.files.imageUrl) return errorResponse(res, 400, 'No file uploaded');
        const uploadedData = await uploadImageOnCloudinary(req.files.imageUrl.tempFilePath, "VleStories");

        const story = await Story.create({
            title,
            caption,
            imageUrl: uploadedData.url,
            publicId: uploadedData.public_id,
            expiredTime,
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
        const stories = await Story.find({ expiredTime: { $gte: new Date() } })
            .sort({ createdAt: -1 })
            .populate('createdBy', 'name email');

        successResponse(res, "Stories fetched successfully", stories);
    } catch (error) {
        next(error);
    }
};

// ✅ Get a single story by ID
exports.getStoryById = async (req, res, next) => {
    try {
        const story = await Story.findById(req.params.id);
        if (!story) return errorResponse(res, 404, "Story not found");

        successResponse(res, "Story fetched successfully", story);
    } catch (error) {
        next(error);
    }
};

// ✅ Update a story
exports.updateStory = async (req, res, next) => {
    try {
        const { title, caption, expiredTime } = req.body;
        let story = await Story.findById(req.params.id);
        if (!story) return errorResponse(res, 404, "Story not found");

        if (story.createdBy.toString() !== req.user.id) {
            return errorResponse(res, 403, "Unauthorized: You can only update your own story");
        }

        if (story.publicId) await deleteImageFromCloudinary(story.publicId);
        const uploadedData = await uploadImageOnCloudinary(req.files.imageUrl.tempFilePath, "VleStories");

        story = await Story.findByIdAndUpdate(
            req.params.id,
            {
                title: title || story.title, 
                caption: caption || story.caption,
                imageUrl: uploadedData.url || story.imageUrl,
                publicId: uploadedData.public_id || story.publicId,
                expiredTime: expiredTime || story.expiredTime
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

        if (story.publicId) await deleteImageFromCloudinary(story.publicId);

        await story.deleteOne();
        successResponse(res, "Story deleted successfully");
    } catch (error) {
        next(error);
    }
};
