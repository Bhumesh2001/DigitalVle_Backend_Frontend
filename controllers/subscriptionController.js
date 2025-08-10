const Razorpay = require("razorpay");
const mongoose = require('mongoose');
const Subscription = require("../models/subscriptionModel");
const SubscriptionPlan = require("../models/subscriptionPlanModel");
const { successResponse, errorResponse } = require("../utils/responseHandler");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
});

// ✅ Create Razorpay Order
exports.createOrder = async (req, res, next) => {
    try {
        const { userId, planId } = req.body;

        const plan = await SubscriptionPlan.findById(planId);
        if (!plan) return errorResponse(res, new Error("Plan not found!"), 404);

        // ✅ Generate a shorter receipt ID (max 40 chars)
        const receiptId = `order_${userId}_${Date.now().toString().slice(-6)}`;

        const order = await razorpay.orders.create({
            amount: plan.price * 100, // Convert to paisa
            currency: "INR",
            receipt: receiptId, // ✅ Shortened
            payment_capture: 1
        });

        return successResponse(res, "Order created successfully!", order);
    } catch (error) {
        next(error);
    }
};

// ✅ Subscribe to a Plan
exports.subscribe = async (req, res, next) => {
    try {
        const {
            userId,
            planId,
            razorpayPaymentId,
            razorpayOrderId,
            category,
            isAllCategories,
            paymentId,
        } = req.body;

        // ✅ Check if user already has an active subscription
        const existingSubscription = await Subscription.findOne({
            userId,
            status: "active",
        });

        if (existingSubscription) {
            return errorResponse(res, 400, "User already has an active subscription.");
        }

        // ✅ Check if plan exists
        const plan = await SubscriptionPlan.findById(planId);
        if (!plan) return errorResponse(res, 404, "Plan not found!");

        const durationDays =
            plan.duration === "monthly" ? 30 :
                plan.duration === "quarterly" ? 90 : 365;

        // ✅ Prepare subscription data
        const subscriptionData = {
            userId,
            planId,
            isAllCategories,
            startDate: new Date(),
            endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
            razorpayPaymentId,
            razorpayOrderId,
            paymentId,
            status: "active",
        };

        // ✅ If not all categories, validate category
        if (!isAllCategories) {
            if (!category || !mongoose.Types.ObjectId.isValid(category)) {
                return errorResponse(res, 400, "Invalid category ID.");
            }
            subscriptionData.category = category;
        }

        // ✅ Save subscription
        const newSubscription = new Subscription(subscriptionData);
        await newSubscription.save();

        return successResponse(res, "Subscription activated successfully!", newSubscription);
    } catch (error) {
        next(error);
    }
};

// ✅ Get User's Subscriptions
exports.getSubscriptions = async (req, res, next) => {
    try {
        const subscriptions = await Subscription.find({ userId: req.params.userId })
            .select('-createdAt -updatedAt -__v')
            .populate('userId', 'name email')
            .populate("planId", 'name price duration features')
            .populate('category', 'name imageUrl')
            .populate('paymentId', 'userId categoryId imageUrl');
        return successResponse(res, "Subscriptions fetched successfully!", subscriptions);
    } catch (error) {
        next(error);
    }
};

// ✅ Cancel Subscription
exports.cancelSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id);
        if (!subscription) return errorResponse(res, new Error("Subscription not found!"), 404);

        subscription.status = "cancelled";
        await subscription.save();

        return successResponse(res, "Subscription cancelled successfully!");
    } catch (error) {
        next(error);
    }
};

// ✅ Get all Subscription(admin)
exports.getAllSubscriptions = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const filter = search ? { "userId.name": { $regex: search, $options: "i" } } : {};

        const subscriptions = await Subscription.find(filter)
            .populate("userId", "name email")
            .populate("planId", "name price duration")
            .populate("category", "name")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Subscription.countDocuments(filter);

        successResponse(res, "Subscriptions fetched successfully!", {
            total,
            page: Number(page),
            limit: Number(limit),
            subscriptions
        });
    } catch (error) {
        next(error);
    }
};
