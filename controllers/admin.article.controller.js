const AdminArticle = require('../models/admin.article.model');
const UserArticle = require('../models/article.model');
const { deleteFromCloudinary } = require('../utils/cloudinary.util');
const { successResponse, errorResponse } = require('../utils/response.util');
const { findArticleById } = require('../utils/article.util');

// Create Article
exports.createArticle = async (req, res, next) => {
    try {
        const { title, description } = req.body;
        const adminId = req.user.id;

        const article = await AdminArticle.create({
            title,
            description,
            createdBy: adminId
        });

        successResponse(res, "Article created successfully", article);
    } catch (error) {
        next(error);
    }
};

// Get All Articles
exports.getAllArticles = async (req, res, next) => {
    try {
        const adminArticles = await AdminArticle.find().sort({ createdAt: -1 }).populate("createdBy", "name email");
        const userArticles = await UserArticle.find().sort({ createdAt: -1 }).populate("createdBy", "name email");

        const articles = [...adminArticles, ...userArticles].sort((a, b) => b.createdAt - a.createdAt);

        successResponse(res, "Articles fetched", articles);
    } catch (error) {
        next(error);
    }
};

// Get Single Article
exports.getSingleArticle = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { type, article } = await findArticleById(id);
        if (!article) return errorResponse(res, 404, "Article not found");

        successResponse(res, "Article fetched successfully", article);
    } catch (error) {
        next(error);
    }
};

// Update Article
exports.updateArticle = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;

        const { type, article } = await findArticleById(id);
        if (!article) return errorResponse(res, 404, "Article not found");

        // Authorization: allow admin for all, user only for own
        if (req.user && type === 'user' && article.createdBy.toString() !== req.user.id)
            return errorResponse(res, 403, "Not allowed");

        if (req.user && type !== 'admin') return errorResponse(res, 403, "Not allowed");

        article.title = title || article.title;
        article.description = description || article.description;
        await article.save();

        successResponse(res, "Article updated", article);
    } catch (error) {
        next(error);
    }
};

// Delete Article
exports.deleteArticle = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { type, article } = await findArticleById(id);
        if (!article) return errorResponse(res, 404, "Article not found");

        if (req.user && type === 'user' && article.createdBy.toString() !== req.user.id)
            return errorResponse(res, 403, "Not allowed");

        if (req.user && type !== 'admin') return errorResponse(res, 403, "Not allowed");

        if (article.publicId) await deleteFromCloudinary(article.publicId);

        const model = type === 'admin' ? AdminArticle : UserArticle;
        await model.findByIdAndDelete(id);

        successResponse(res, "Article deleted");
    } catch (error) {
        next(error);
    }
};
