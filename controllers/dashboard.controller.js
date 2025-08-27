const User = require('../models/user.model');
const Video = require('../models/video.model');
const Category = require('../models/category.model');
const Like = require('../models/like.model'); // assuming Like model exists
const Comment = require('../models/comment.model'); // assuming Comment model exists
const Article = require('../models/article.model');
const AdminArticle = require('../models/admin.article.model');
const Subscription = require('../models/subscription.model');
const { successResponse } = require('../utils/response.util');

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
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    year: "$_id.year",
                    month: "$_id.month",
                    count: 1,
                    _id: 0
                }
            },
            {
                $sort: { year: 1, month: 1 }
            }
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
