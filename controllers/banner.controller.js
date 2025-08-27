const Banner = require("../models/banner.model");
const { deleteFromCloudinary } = require("../utils/cloudinary.util");
const { successResponse, errorResponse } = require("../utils/response.util");

// ✅ Create Banner
exports.createBanner = async (req, res, next) => {
    try {
        const { name, status } = req.body;

        const newBanner = await Banner.create({
            name,
            status,
        });

        successResponse(res, "Banner uploaded successfully", newBanner);
    } catch (error) {
        next(error);
    }
};

// ✅ Get All Banners
exports.getAllBanners = async (req, res, next) => {
    try {
        const banners = await Banner.find().select('imageUrl status');
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
        const { status, name } = req.body;

        const banner = await Banner.findById(id);
        if (!banner) return errorResponse(res, 404, "Banner not found");

        if(name) banner.name = name;
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

        await deleteFromCloudinary(banner.publicId);
        await banner.deleteOne();

        successResponse(res, "Banner deleted successfully");
    } catch (error) {
        next(error);
    }
};
