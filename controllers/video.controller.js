const Video = require("../models/video.model");
const Category = require("../models/category.model");
const { successResponse, errorResponse } = require("../utils/response.util");
const { fetchVideos, attachPaidStatus } = require('../utils/subscription.util');
const {
    deleteFromCloudinary,
} = require('../utils/cloudinary.util');

// ✅ Create a new video
exports.createVideo = async (req, res, next) => {
    try {
        const { title, description, category, tags } = req.body;

        if (!title || !description || !category) {
            return errorResponse(res, 400, "All fields are required!");
        }

        const newVideo = await Video.create({
            title,
            description,
            category,
            tags,
        });
        successResponse(res, "Video created successfully!", newVideo);
    } catch (error) {
        next(error);
    }
};

// ✅ Update a video by ID
exports.updateVideo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, category, tags } = req.body;

        const video = await Video.findById(id);
        if (!video) return errorResponse(res, 404, "Video not found!");

        // ✅ Update the video fields
        video.title = title ?? video.title;
        video.description = description ?? video.description;
        video.category = category ?? video.category;
        video.tags = tags ?? video.tags;

        await video.save();

        successResponse(res, "Video updated successfully!", video);
    } catch (error) {
        next(error);
    }
};

// ✅ Delete a video by ID
exports.deleteVideo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedVideo = await Video.findByIdAndDelete(id);
        if (!deletedVideo) return errorResponse(res, 404, "Video not found!");

        if (deletedVideo.thumbnailPublicId) await deleteFromCloudinary(deletedVideo.thumbnailPublicId);
        if (deletedVideo.videoPublicId) await deleteFromCloudinary(deletedVideo.videoPublicId, 'video');

        successResponse(res, "Video deleted successfully!");
    } catch (error) {
        next(error);
    }
};

// ✅ Get all videos with pagination & subscription check
exports.getVideos = async (req, res, next) => {
    const { page = 1, limit = 10, search = "" } = req.query;
    const filter = search ? { title: { $regex: search, $options: "i" } } : {};
    fetchVideos(filter, req.user.id, res, "Videos fetched successfully!");
};

// ✅ Get a single video by ID
exports.getVideoById = async (req, res, next) => {
    try {
        const video = await Video.findById(req.params.id).populate("category");
        if (!video) return errorResponse(res, 404, "Video not found!");
        successResponse(res, "Video fetched successfully!", await attachPaidStatus([video], req.user.id)[0]);
    } catch (error) {
        next(error);
    }
};

// ✅ Get videos by category
exports.getVideosByCategory = async (req, res, next) => {
    fetchVideos({ category: req.params.categoryId }, req.user.id, res, "Videos fetched by category!", next);
};

// ✅ Get related videos
exports.getRelatedVideos = async (req, res, next) => {
    try {
        const video = await Video.findById(req.params.videoId).populate("category");
        if (!video) return errorResponse(res, 404, "Video not found!");

        const filter = {
            _id: { $ne: video._id },
            category: video.category,
            tags: { $in: video.tags }
        };

        fetchVideos(filter, req.user.id, res, "Related videos fetched successfully!", next);
    } catch (error) {
        next(error);
    }
};

// ✅ Get all videos for Admin (with Pagination & Search)
exports.getAdminVideos = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const filter = search ? { title: { $regex: search, $options: "i" } } : {};

        const videos = await Video.find(filter)
            .populate("category", "name imageUrl status")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        successResponse(res, "All videos fetched successfully!", videos);
    } catch (error) {
        next(error);
    }
};

// ✅ Get a single video by ID for Admin
exports.getAdminVideoById = async (req, res, next) => {
    try {
        const video = await Video.findById(req.params.id).populate("category", "name imageUrl status");
        if (!video) return errorResponse(res, 404, "Video not found!");
        successResponse(res, "Video fetched successfully!", video);
    } catch (error) {
        next(error);
    }
};

// ✅ Search video by category name or video name
exports.searchVideos = async (req, res, next) => {
    try {
        const { search } = req.query;
        const userId = req.user?.id; // Optional chaining in case of unauthenticated user

        let filter = {};

        if (search) {
            // Find category IDs based on search text
            const categoryIds = await Category.find({
                name: { $regex: search, $options: "i" }
            }).distinct("_id");

            filter = {
                $or: [
                    { title: { $regex: search, $options: "i" } },
                    { category: { $in: categoryIds } }
                ]
            };
        }

        let videos = await Video.find(filter)
            .select('-createdAt -updatedAt -__v -thumbnailPublicId -videoPublicId')
            .populate("category", "name imageUrl")
            .sort({ createdAt: -1 });

        // Add paid field to each video
        videos = await attachPaidStatus(videos, userId);

        return successResponse(res, "Videos fetched successfully", {
            results: videos.length,
            videos,
        });
    } catch (error) {
        next(error);
    }
};
