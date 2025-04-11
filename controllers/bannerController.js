const Banner = require("../models/bannerModel");
const { uploadImageOnCloudinary, deleteImageFromCloudinary } = require("../utils/cloudinaryUtils");
const { successResponse, errorResponse } = require("../utils/responseHandler");

// ✅ Create Banner
exports.createBanner = async (req, res, next) => {
    try {
        if (!req.files || !req.files.imageUrl) {
            return errorResponse(res, 400, "No image uploaded");
        }

        const uploadedData = await uploadImageOnCloudinary(req.files.imageUrl.tempFilePath, "VleBanners");

        const newBanner = await Banner.create({
            imageUrl: uploadedData.url,
            publicId: uploadedData.public_id,
            status: req.body.status,
        });

        successResponse(res, "Banner uploaded successfully", newBanner);
    } catch (error) {
        next(error);
    }
};

// ✅ Get All Banners
exports.getAllBanners = async (req, res, next) => {
    try {
        const banners = await Banner.find();
        successResponse(res, "Banners fetched successfully", banners);
    } catch (error) {
        next(error);
    }
};

// ✅ Get Single Banner by ID
exports.getBannerById = async (req, res, next) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) return errorResponse(res, 404, "Banner not found");
        successResponse(res, "Banner fetched successfully", banner);
    } catch (error) {
        next(error);
    }
};

// ✅ Update Banner
exports.updateBanner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const banner = await Banner.findById(id);
        if (!banner) return errorResponse(res, 404, "Banner not found");

        if (req.files?.imageUrl) {
            await deleteImageFromCloudinary(banner.publicId);
            const uploadedData = await uploadImageOnCloudinary(req.files.imageUrl.tempFilePath, "VleBanners");
            banner.imageUrl = uploadedData.url;
            banner.publicId = uploadedData.public_id;
        }

        if (status) banner.status = status;

        await banner.save();
        successResponse(res, "Banner updated successfully", banner);
    } catch (error) {
        next(error);
    }
};

// ✅ Delete Banner
exports.deleteBanner = async (req, res, next) => {
    try {
        const { id } = req.params;

        const banner = await Banner.findById(id);
        if (!banner) return errorResponse(res, 404, "Banner not found");

        await deleteImageFromCloudinary(banner.publicId);
        await banner.deleteOne();

        successResponse(res, "Banner deleted successfully");
    } catch (error) {
        next(error);
    }
};
