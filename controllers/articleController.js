const Article = require("../models/articleModel");
const AdminArticle = require("../models/adminArticleModel");
const { successResponse, errorResponse } = require("../utils/responseHandler");
const { deleteImageFromCloudinary, uploadImageOnCloudinary } = require('../utils/cloudinaryUtils');

// ✅ Create Article
exports.createArticle = async (req, res, next) => {
    try {
        const { title, description } = req.body;
        const createdBy = req.user.id;

        if (!req.files || !req.files.imageUrl) return errorResponse(res, 400, 'No file uploaded');
        const uploadedData = await uploadImageOnCloudinary(req.files.imageUrl.tempFilePath, "VleArticles");

        const article = await Article.create({
            title,
            description,
            imageUrl: uploadedData.url,
            publicId: uploadedData.public_id,
            createdBy
        });
        successResponse(res, "Article created successfully", article);
    } catch (error) {
        next(error);
    }
};

// ✅ Get All Articles
exports.getAllArticles = async (req, res, next) => {
    try {
        const adminArticles = await AdminArticle.find().sort({ createdAt: -1 }).populate("createdBy", "name email");
        const userArticles = await Article.find().sort({ createdAt: -1 }).populate("createdBy", "name email");

        const articles = [...adminArticles, ...userArticles].sort((a, b) => b.createdAt - a.createdAt);

        successResponse(res, "Articles fetched", articles);
    } catch (error) {
        next(error);
    }
};

// ✅ Get Single Article
exports.getArticleById = async (req, res, next) => {
    try {
        const article = await Article.findById(req.params.id).populate("createdBy", "name email");
        if (!article) return errorResponse(res, 404, "Article not found");

        successResponse(res, "Article retrieved successfully", article);
    } catch (error) {
        next(error);
    }
};

// ✅ Update Article
exports.updateArticle = async (req, res, next) => {
    try {
        const { title, description } = req.body;
        const article = await Article.findById(req.params.id);
        if (!article) return errorResponse(res, 404, "Article not found");

        if (article.createdBy.toString() !== req.user.id) return errorResponse(
            res, 403, "Unauthorized to update this article"
        );

        if (article.publicId) await deleteImageFromCloudinary(article.publicId);
        const uploadedData = await uploadImageOnCloudinary(req.files.imageUrl.tempFilePath, "VleArticles");

        article.title = title || article.title;
        article.description = description || article.description;
        article.imageUrl = uploadedData.url || article.imageUrl;
        article.publicId = uploadedData.public_id || article.publicId;

        await article.save();
        successResponse(res, "Article updated successfully", article);
    } catch (error) {
        next(error);
    }
};

// ✅ Delete Article
exports.deleteArticle = async (req, res, next) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return errorResponse(res, 404, "Article not found");

        if (article.createdBy.toString() !== req.user.id) return errorResponse(
            res, 403, "Unauthorized to delete this article"
        );

        if (article.publicId) await deleteImageFromCloudinary(article.publicId);

        await article.deleteOne();
        successResponse(res, "Article deleted successfully");
    } catch (error) {
        next(error);
    }
};
