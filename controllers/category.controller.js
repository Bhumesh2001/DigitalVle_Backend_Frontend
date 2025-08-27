const Category = require("../models/category.model");
const { successResponse, errorResponse } = require("../utils/response.util");
const { deleteFromCloudinary } = require('../utils/cloudinary.util')

// ✅ Create Category
exports.createCategory = async (req, res, next) => {
    try {
        const { name, status } = req.body;

        const existingCategory = await Category.findOne({ name });
        if (existingCategory) return errorResponse(res, 400, "Category already exists");

        const category = await Category.create({
            name,
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
        const categories = await Category.find().select('name imageUrl status').sort({ createdAt: -1 });
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

        category.name = name || category.name;
        category.status = status || category.status;

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

        if (category.publicId) await deleteFromCloudinary(category.publicId);

        successResponse(res, "Category deleted successfully");
    } catch (error) {
        next(error);
    }
};
