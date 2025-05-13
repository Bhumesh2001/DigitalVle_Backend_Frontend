const User = require('../models/userModel');
const Video = require('../models/videoModel');
const Category = require('../models/categoryModel');
const Like = require('../models/likeModel'); // assuming Like model exists
const Comment = require('../models/commentModel'); // assuming Comment model exists
const Article = require('../models/articleModel');
const AdminArticle = require('../models/adminArticleModel');
const Subscription = require('../models/subscriptionModel');
const { successResponse } = require('../utils/responseHandler');

exports.getDashboardSummary = async (req, res, next) => {
    try {
        const [
            totalUsers,
            totalVideos,
            totalCategories,
            totalLikes,
            totalComments,
            totalArticles,
            totalAdminArticles,
            totalSubscribers,
            totalAmount
        ] = await Promise.all([
            User.countDocuments(),
            Video.countDocuments(),
            Category.countDocuments(),
            Like.countDocuments(),
            Comment.countDocuments(),
            Article.countDocuments(),
            AdminArticle.countDocuments(),
            Subscription.countDocuments({ status: 'active' }),
            Subscription.aggregate([
                { $match: { status: 'active' } },
                {
                    $lookup: {
                        from: 'subscriptionplans',
                        localField: 'planId',
                        foreignField: '_id',
                        as: 'plan'
                    }
                },
                { $unwind: '$plan' },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$plan.price' }
                    }
                }
            ])
        ]);

        return successResponse(res, "State fetched successfully!", {
            totalUsers,
            totalVideos,
            totalCategories,
            totalLikes,
            totalComments,
            totalArticles: totalArticles + totalAdminArticles,
            totalSubscribers,
            totalAmount: totalAmount[0]?.total || 0
        });
    } catch (error) {
        next(error);
    }
};

exports.getUserAnalytics = async (req, res, next) => {
    try {
        const analytics = await User.aggregate([
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    month: '$_id',
                    count: 1,
                    _id: 0
                }
            },
            { $sort: { month: 1 } }
        ]);

        return successResponse(res, "Analytics fetched successfully!", analytics);
    } catch (error) {
        next(error);
    }
};

exports.getLatestUsers = async (req, res, next) => {
    try {
        const users = await User.find({})
            .sort({ createdAt: -1 })  // Sort by latest
            .limit(5)
            .select("name email");

        return successResponse(res, "Latest 5 users fetched successfully", users);
    } catch (error) {
        next(error);
    }
};
