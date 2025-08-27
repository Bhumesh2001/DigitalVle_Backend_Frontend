const Article = require("../models/article.model");
const AdminArticle = require("../models/admin.article.model");
const { successResponse, errorResponse } = require("../utils/response.util");
const { deleteFromCloudinary } = require('../utils/cloudinary.util');

// ✅ Create Article
exports.createArticle = async (req, res, next) => {
    try {
        const { title, description } = req.body;
        const createdBy = req.user.id;

        const article = await Article.create({
            title,
            description,
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
        const adminArticles = await AdminArticle.find()
            .select('title description imageUrl createdBy')
            .sort({ createdAt: -1 })
            .populate("createdBy", "name email");

        const userArticles = await Article.find()
            .select('title description imageUrl createdBy')
            .sort({ createdAt: -1 })
            .populate("createdBy", "name email");

        const articles = [...adminArticles, ...userArticles].sort((a, b) => b.createdAt - a.createdAt);

        successResponse(res, "Articles fetched", articles);
    } catch (error) {
        next(error);
    }
};

// ✅ Get Single Article
exports.getArticleById = async (req, res, next) => {
    try {
        const article = await Article.findById(req.params.id)
            .select('title description imageUrl createdBy')
            .populate("createdBy", "name email");
            
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
        
        article.title = title || article.title;
        article.description = description || article.description;

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

        if (article.publicId) await deleteFromCloudinary(article.publicId);

        await article.deleteOne();
        successResponse(res, "Article deleted successfully");
    } catch (error) {
        next(error);
    }
};
