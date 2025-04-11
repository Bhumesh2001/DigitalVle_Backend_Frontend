const Category = require("../models/categoryModel");
const { successResponse, errorResponse } = require("../utils/responseHandler");
const { deleteImageFromCloudinary, uploadImageOnCloudinary } = require('../utils/cloudinaryUtils');

// ✅ Create Category
exports.createCategory = async (req, res, next) => {
    try {
        const { name, status } = req.body;

        const existingCategory = await Category.findOne({ name });
        if (existingCategory) return errorResponse(res, 400, "Category already exists");

        if (!req.files || !req.files.imageUrl) return errorResponse(res, 400, 'No file uploaded');

        const uploadedData = await uploadImageOnCloudinary(req.files.imageUrl.tempFilePath, "VleCategories");

        const category = await Category.create({
            name,
            imageUrl: uploadedData.url,
            publicId: uploadedData.public_id,
            status
        });
        successResponse(res, "Category created successfully", category);
    } catch (error) {
        next(error);
    }
};

// ✅ Get All Categories
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        successResponse(res, "Categories retrieved successfully", categories);
    } catch (error) {
        next(error);
    }
};

// ✅ Get Single Category
exports.getCategoryById = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return errorResponse(res, 404, "Category not found");

        successResponse(res, "Category retrieved successfully", category);
    } catch (error) {
        next(error);
    }
};

// ✅ Update Category
exports.updateCategory = async (req, res, next) => {
    try {
        const { name, status } = req.body;

        const category = await Category.findById(req.params.id);
        if (!category) return errorResponse(res, 404, "Category not found");

        if (category.publicId) await deleteImageFromCloudinary(category.publicId);
        const uploadedData = await uploadImageOnCloudinary(req.files.imageUrl.tempFilePath, "VleCategories");

        category.name = name || category.name;
        category.status = status || category.status;
        category.imageUrl = uploadedData.url || category.imageUrl;
        category.publicId = uploadedData.public_id || category.publicId;

        await category.save();

        successResponse(res, "Category updated successfully", category);
    } catch (error) {
        next(error);
    }
};

// ✅ Delete Category
exports.deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return errorResponse(res, 404, "Category not found");

        if (category.publicId) await deleteImageFromCloudinary(category.publicId);

        successResponse(res, "Category deleted successfully");
    } catch (error) {
        next(error);
    }
};
