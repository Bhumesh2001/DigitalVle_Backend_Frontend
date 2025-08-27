const AdminArticle = require('../models/admin.article.model');
const UserArticle = require('../models/article.model');

exports.findArticleById = async (id) => {
    const adminArticle = await AdminArticle.findById(id);
    if (adminArticle) return { type: 'admin', article: adminArticle };

    const userArticle = await UserArticle.findById(id);
    if (userArticle) return { type: 'user', article: userArticle };

    return { article: null };
};
