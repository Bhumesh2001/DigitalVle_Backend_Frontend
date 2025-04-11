const Video = require("../models/videoModel");
const { successResponse, errorResponse } = require("../utils/responseHandler");
const { fetchVideos, attachPaidStatus } = require('../utils/subscriptionUtils');
const {
    deleteImageFromCloudinary,
    uploadImageOnCloudinary,
    uploadVideoOnCloudinary
} = require('../utils/cloudinaryUtils');

// ✅ Create a new video
exports.createVideo = async (req, res, next) => {
    try {
        const { title, description, category, tags } = req.body;

        if (!title || !description || !category) {
            return errorResponse(res, 400, "All fields are required!");
        }

        if (!req.files || !req.files.thumbnailUrl && req.files.videoUrl) return errorResponse(
            res, 400, 'No file uploaded'
        );
        const uploadedData = await uploadImageOnCloudinary(req.files.thumbnailUrl.tempFilePath, "VleThumbnails");
        const uploadedData_ = await uploadVideoOnCloudinary(req.files.videoUrl.tempFilePath, "VleVideos");

        const newVideo = await Video.create({
            title,
            description,
            category,
            thumbnailUrl: uploadedData.url,
            thumbnailPublicId: uploadedData.public_id,
            videoUrl: uploadedData_.url,
            videoPublicId: uploadedData_.public_id,
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

        // ✅ Delete old Cloudinary files if they exist
        if (video.thumbnailPublicId && req.files?.thumbnailUrl) {
            await deleteImageFromCloudinary(video.thumbnailPublicId);
        }
        if (video.videoPublicId && req.files?.videoUrl) {
            await deleteImageFromCloudinary(video.videoPublicId, 'video');
        }

        // ✅ Upload new files to Cloudinary
        const uploadedThumbnail = req.files?.thumbnailUrl
            ? await uploadImageOnCloudinary(req.files.thumbnailUrl.tempFilePath, "VleThumbnails")
            : null;

        const uploadedVideo = req.files?.videoUrl
            ? await uploadVideoOnCloudinary(req.files.videoUrl.tempFilePath, "VleVideos")
            : null;

        // ✅ Update the video fields
        video.title = title ?? video.title;
        video.description = description ?? video.description;
        video.category = category ?? video.category;
        video.thumbnailUrl = uploadedThumbnail?.url ?? video.thumbnailUrl;
        video.thumbnailPublicId = uploadedThumbnail?.public_id ?? video.thumbnailPublicId;
        video.videoUrl = uploadedVideo?.url ?? video.videoUrl;
        video.videoPublicId = uploadedVideo?.public_id ?? video.videoPublicId;
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

        if (deletedVideo.thumbnailPublicId) await deleteImageFromCloudinary(deletedVideo.thumbnailPublicId);
        if (deletedVideo.videoPublicId) await deleteImageFromCloudinary(deletedVideo.videoPublicId, 'video');

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
