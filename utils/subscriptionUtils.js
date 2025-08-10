const cron = require("node-cron");
const Subscription = require("../models/subscriptionModel");
const Video = require('../models/videoModel');
const sendEmail = require("../services/emailService");
const { subscriptionReminderTemplate, expiryReminderTemplate } = require('../utils/emailTemplates');
const { successResponse } = require("../utils/responseHandler");

// ✅ Send Reminder Before Expiry
cron.schedule("0 0 * * *", async () => { // Runs every day at midnight
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);

    const expiringSubscriptions = await Subscription.find({
        endDate: { $lte: threeDaysLater, $gt: today },
        status: "active"
    }).populate("userId");

    for (let sub of expiringSubscriptions) {
        const userEmail = sub.userId.email;
        await sendEmail(userEmail, "Subscription Expiry Reminder", subscriptionReminderTemplate(sub));
    }
});

// ✅ Mark Subscriptions as Expired and Send Emails
cron.schedule("0 * * * *", async () => { // Runs every hour
    try {
        const today = new Date();

        // ✅ Find expired subscriptions
        const expiredSubscriptions = await Subscription.find({
            endDate: { $lt: today },
            status: "active",
        }).populate("userId"); // Get user details

        if (expiredSubscriptions.length === 0) return;

        // ✅ Update status to "expired"
        await Subscription.updateMany(
            { endDate: { $lt: today }, status: "active" },
            { status: "expired" }
        );

        // ✅ Send email to each user
        for (let subscription of expiredSubscriptions) {
            const user = subscription.userId; // Get user data

            if (user && user.email) {
                await sendEmail(
                    user.email,
                    "Subscription Expired - Renew Now!",
                    expiryReminderTemplate(user, subscription)
                );
            }
        };

        // console.log("✅ Subscription Expiry Cron Job Completed!");
    } catch (error) {
        console.error("❌ Error in Subscription Expiry Cron Job:", error.message);
    }
});

const hasSubscription = async (userId) => {
    try {
        const subscription = await Subscription.findOne({
            userId,
            status: "active"
        }).populate("category", "name").lean();

        if (!subscription) return false; // ❌ No active subscription

        return subscription.isAllCategories ? true : subscription.category?.name || false;
    } catch (error) {
        console.error("Error checking subscription:", error.message);
        return false;
    }
};

// 🔹 Helper function to add 'paid' status
const attachPaidStatus = async (videos, userId) => {
    const userSubscription = await hasSubscription(userId);
    return videos.map(video => ({
        ...video.toObject(),
        paid: userSubscription === true || userSubscription === video.category?.name
    }));
};

// ✅ Generic function to fetch videos with optional filters
const fetchVideos = async (filter, userId, res, message, next) => {
    try {
        let videos = await Video.find(filter)
            .select('-createdAt -updatedAt -__v -thumbnailPublicId -videoPublicId')
            .populate("category", "name imageUrl")
            .sort({ createdAt: -1 });
        videos = await attachPaidStatus(videos, userId);
        successResponse(res, message, videos);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    attachPaidStatus,
    fetchVideos,
};
