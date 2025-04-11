const Like = require("../models/likeModel");
const Comment = require("../models/commentModel");
const { errorResponse, successResponse } = require("../utils/responseHandler");

// ✅ Like a content
exports.likeContent = async (req, res, next) => {
    try {
        const { contentId, contentType } = req.body;
        const userId = req.user.id;

        if (!contentId || !contentType) return errorResponse(res, 400, "Content ID and type are required");

        const existingLike = await Like.findOne({ userId, contentId });
        if (existingLike) return errorResponse(res, 400, "Already liked!");

        await Like.create({ userId, contentId, contentType });
        successResponse(res, "Liked successfully!");
    } catch (error) {
        next(error);
    }
};

// ✅ Unlike a content
exports.unlikeContent = async (req, res, next) => {
    try {
        const { contentId } = req.body;
        const userId = req.user.id;

        if (!contentId) return errorResponse(res, 400, "Content ID is required");

        const like = await Like.findOneAndDelete({ userId, contentId });
        if (!like) return errorResponse(res, 404, "Like not found!");

        successResponse(res, "Unliked successfully!");
    } catch (error) {
        next(error);
    }
};

// ✅ Add a comment
exports.addComment = async (req, res, next) => {
    try {
        const { contentId, contentType, text, parentId } = req.body;
        const userId = req.user.id;

        if (!contentId || !contentType || !text) return errorResponse(res, 400, "Content ID, type, and text are required");

        const comment = await Comment.create({ userId, contentId, contentType, text, parentId });
        successResponse(res, "Comment added successfully!", comment);
    } catch (error) {
        next(error);
    }
};

// ✅ Edit a comment
exports.editComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const { text } = req.body;
        const userId = req.user.id;

        if (!commentId || !text) return errorResponse(res, 400, "Comment ID and text are required");
        const comment = await Comment.findOneAndUpdate(
            { _id: commentId, userId },
            { text },
            { new: true }
        );

        if (!comment) return errorResponse(res, 404, "Comment not found or unauthorized");

        successResponse(res, "Comment updated successfully!", comment);
    } catch (error) {
        next(error);
    }
};

// ✅ Fetch comments with replies
exports.getComments = async (req, res, next) => {
    try {
        const { contentId } = req.params;
        if (!contentId) return errorResponse(res, 400, "Content ID is required");

        const comments = await Comment.find({ contentId, parentId: null })
            .populate({ path: "userId", select: "name" })
            .populate({ path: "parentId", select: "text userId" });

        successResponse(res, "Comments fetched successfully!", comments);
    } catch (error) {
        next(error);
    }
};

// ✅ Delete a comment
exports.deleteComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        if (!commentId) return errorResponse(res, 400, "Comment ID is required");

        const comment = await Comment.findOneAndDelete({ _id: commentId, userId });
        if (!comment) return errorResponse(res, 404, "Comment not found!");

        successResponse(res, "Comment deleted successfully!");
    } catch (error) {
        next(error);
    }
};
