const AdminArticle = require('../models/adminArticleModel');
const UserArticle = require('../models/articleModel');

exports.findArticleById = async (id) => {
    const adminArticle = await AdminArticle.findById(id);
    if (adminArticle) return { type: 'admin', article: adminArticle };

    const userArticle = await UserArticle.findById(id);
    if (userArticle) return { type: 'user', article: userArticle };

    return { article: null };
};
