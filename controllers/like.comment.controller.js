const Like = require("../models/like.model");
const Comment = require("../models/comment.model");
const User = require('../models/user.model');
const Video = require("../models/video.model");
const Article = require("../models/article.model");
const Story = require("../models/story.model");
const AdminArticle = require('../models/admin.article.model');
const AdminStory = require('../models/admin.story.model');
const { errorResponse, successResponse } = require("../utils/response.util");

// Map contentType to models
const contentModels = {
    video: Video,
    article: Article,
    story: Story,
    comment: Comment,
    adminarticle: AdminArticle, // ✅ Admin ke Article
    adminstory: AdminStory,     // ✅ Admin ke Story
};

// ✅ Like a content
exports.likeContent = async (req, res, next) => {
    try {
        const { contentId, contentType } = req.body;
        const userId = req.user.id;

        if (!contentId || !contentType) {
            return errorResponse(res, 400, "Content ID and type are required");
        }

        const Model = contentModels[contentType.toLowerCase()];
        if (!Model) {
            return errorResponse(res, 400, "Invalid content type");
        }

        const [existingLike, content, user] = await Promise.all([
            Like.findOne({ userId, contentId }),
            Model.findById(contentId)
                .select('-createdAt -updatedAt -__v -publicId -thumbnailPublicId -videoPublicId'),
            User.findById(userId).select("name email"),
        ]);

        if (existingLike) {
            return errorResponse(res, 400, "Already liked!");
        }

        if (!content) {
            return errorResponse(res, 404, "Content not found");
        }

        const like = await Like.create({ userId, contentId, contentType });

        return successResponse(res, "Liked successfully!", {
            likeId: like._id,
            likedBy: user,
            contentType,
            content,
        });
    } catch (error) {
        next(error);
    }
};

// ✅ Unlike a content
exports.unlikeContent = async (req, res, next) => {
    try {
        const { contentId, contentType } = req.body;
        const userId = req.user.id;

        if (!contentId || !contentType) {
            return errorResponse(res, 400, "Content ID and type are required");
        }

        const Model = contentModels[contentType.toLowerCase()];
        if (!Model) {
            return errorResponse(res, 400, "Invalid content type");
        }

        const like = await Like.findOneAndDelete({ userId, contentId, contentType });
        if (!like) {
            return errorResponse(res, 404, "Like not found or already unliked");
        }

        const [content, user] = await Promise.all([
            Model.findById(contentId)
                .select("-createdAt -updatedAt -__v -publicId -thumbnailPublicId -videoPublicId"),
            User.findById(userId).select("name email")
        ]);

        return successResponse(res, "Unliked successfully!", {
            contentId,
            contentType,
            user,
            content
        });
    } catch (error) {
        next(error);
    }
};

// ✅ Add a comment
exports.addComment = async (req, res, next) => {
    try {
        const { contentId, contentType, text, parentId } = req.body;
        const userId = req.user.id;

        // 🔍 Validate required fields
        if (!contentId || !contentType || !text) {
            return errorResponse(res, 400, "Content ID, type, and text are required");
        }

        // 📦 Resolve the model based on content type
        const Model = contentModels[contentType.toLowerCase()];
        if (!Model) {
            return errorResponse(res, 400, "Invalid content type");
        }

        // 📝 Create the comment
        const comment = await Comment.create({
            userId,
            contentId,
            contentType,
            text,
            parentId: parentId || null
        });

        // 🚀 Parallel data fetch: user and content info
        const [user, content] = await Promise.all([
            User.findById(userId).select("name email"),
            Model.findById(contentId)
                .select("-createdAt -updatedAt -__v -publicId -thumbnailPublicId -videoPublicId")
        ]);

        // ✅ Respond with full comment details
        return successResponse(res, "Comment added successfully!", {
            commentId: comment._id,
            text: comment.text,
            parentId: comment.parentId,
            user: {
                _id: user?._id,
                name: user?.name,
                email: user?.email
            },
            content: {
                _id: contentId,
                type: contentType,
                title: content?.title || null,
                description: content?.description || null
            },
            createdAt: comment.createdAt
        });
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

        const comments = await Comment.find({ contentId, parentId: null }).select('-__v')
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
