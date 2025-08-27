const { successResponse, errorResponse } = require("../utils/response.util");
const { deleteFromCloudinary, uploadToCloudinary } = require('../utils/cloudinary.util');
const User = require("../models/user.model");
const mongoose = require("mongoose");

// ✅ Dynamic Media Delete API
exports.deleteMedia = async (req, res, next) => {
    try {
        const { public_id, type } = req.body;

        if (!public_id) {
            return errorResponse(res, 400, "public_id is required!");
        }

        if (!["image", "video"].includes(type)) {
            return errorResponse(res, 400, "Invalid media type! Must be 'image' or 'video'");
        }

        const result = await deleteFromCloudinary(public_id, type);

        if (result.result !== "ok") {
            return errorResponse(res, 400, "Failed to delete media from Cloudinary");
        }

        return successResponse(res, `${type} deleted successfully`, { public_id });
    } catch (err) {
        next(err);
    }
};

// ✅ Update User Picture API
exports.updateUserPicture = async (req, res, next) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return errorResponse(res, 400, "userId is required!");
        }

        // ✅ Find user
        const user = await User.findById(userId);
        if (!user) {
            return errorResponse(res, 404, "User not found!");
        }

        // ✅ If user already has picture → delete old one from Cloudinary
        if (user.publicId) {
            await deleteFromCloudinary(user.publicId);
        }

        // ✅ Upload new image
        const result = await uploadToCloudinary(req.file.path, "images", "image");

        // ✅ Update user fields dynamically
        user.profileUrl = result.secure_url;
        user.publicId = result.public_id;

        await user.save();

        return successResponse(res, "Profile picture updated successfully", {
            url: result.secure_url,
            public_id: result.public_id,
        });
    } catch (err) {
        next(err);
    }
};

// ✅ Dynamic Upload Save API
exports.saveUploadInfo = async (req, res, next) => {
    try {
        const {
            secure_url,
            public_id,
            document_id,
            collection_name,
            type = "image",
            thumbnail_url,
            thumbnail_public_id
        } = req.body;

        // ✅ Validate required fields
        if (!document_id || !collection_name) {
            return errorResponse(res, 400, "All fields are required");
        }

        // ✅ Get collection dynamically
        let Model;
        try {
            Model = mongoose.connection.model(collection_name);
        } catch (err) {
            return errorResponse(res, 400, "Invalid collection name");
        }

        // ✅ Get document
        const document = await Model.findById(document_id);
        if (!document) return errorResponse(res, 404, "Document not found");

        // ✅ Prepare dynamic update object
        const updateData = {};

        if (type === "image") {
            updateData.imageUrl = secure_url;
            updateData.publicId = public_id;
        }

        if (type === "video") {
            updateData.videoUrl = secure_url;
            updateData.videoPublicId = public_id;
            if (thumbnail_url) updateData.thumbnailUrl = thumbnail_url;
            if (thumbnail_public_id) updateData.thumbnailPublicId = thumbnail_public_id;
        }

        // ✅ Update document
        const updatedDoc = await Model.findByIdAndUpdate(
            document_id,
            { $set: updateData },
            { new: true }
        );

        return successResponse(res, "Upload info saved successfully", updatedDoc);
    } catch (error) {
        next(error);
    }
};

// ✅  Upload Image
exports.uploadImage = async (req, res, next) => {
    try {
        if (!req.file) return errorResponse(res, 400, "No file uploaded");

        const result = await uploadToCloudinary(req.file.path, "images", "image");

        return successResponse(res, "Image uploaded successfully", {
            url: result.secure_url,
            public_id: result.public_id,
        });
    } catch (err) {
        next(err);
    }
};

// ✅ Upload Video (Large File Support)
exports.uploadVideo = async (req, res, next) => {
    try {
        if (!req.file) return errorResponse(res, 400, "No file uploaded");

        const result = await uploadToCloudinary(req.file.path, "videos", "video");

        return successResponse(res, "Video uploaded successfully", {
            url: result.secure_url,
            public_id: result.public_id,
        });
    } catch (err) {
        next(err);
    }
};
