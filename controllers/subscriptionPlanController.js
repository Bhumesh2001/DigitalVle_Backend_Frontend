const SubscriptionPlan = require("../models/subscriptionPlanModel");
const { successResponse, errorResponse } = require("../utils/responseHandler");

/**
 * ✅ Create a new subscription plan
 */
exports.createSubscriptionPlan = async (req, res, next) => {
    try {
        const { name, price, duration, features } = req.body;

        const newPlan = new SubscriptionPlan({ name, price, duration, features });
        await newPlan.save();

        successResponse(res, "Subscription plan created successfully!", newPlan);
    } catch (error) {
        next(error);
    }
};

/**
 * ✅ Get all subscription plans
 */
exports.getAllSubscriptionPlans = async (req, res, next) => {
    try {
        const plans = await SubscriptionPlan.find()
            .select('-createdAt -updatedAt -__v')
            .sort({ createdAt: -1 });
        successResponse(res, "Subscription plans fetched successfully!", plans);
    } catch (error) {
        next(error);
    }
};

/**
 * ✅ Get a single subscription plan by ID
 */
exports.getSubscriptionPlanById = async (req, res, next) => {
    try {
        const plan = await SubscriptionPlan.findById(req.params.id);
        if (!plan) return errorResponse(res, 404, "Subscription plan not found!");

        successResponse(res, "Subscription plan fetched successfully!", plan);
    } catch (error) {
        next(error);
    }
};

/**
 * ✅ Update a subscription plan
 */
exports.updateSubscriptionPlan = async (req, res, next) => {
    try {
        const { name, price, duration, features, status } = req.body;
        const plan = await SubscriptionPlan.findById(req.params.id);

        if (!plan) return errorResponse(res, 404, "Subscription plan not found!");

        // Update only provided fields
        plan.name = name || plan.name;
        plan.price = price || plan.price;
        plan.duration = duration || plan.duration;
        plan.features = features || plan.features;
        plan.status = status || plan.status;

        await plan.save();

        successResponse(res, "Subscription plan updated successfully!", plan);
    } catch (error) {
        next(error);
    }
};

/**
 * ✅ Delete a subscription plan
 */
exports.deleteSubscriptionPlan = async (req, res, next) => {
    try {
        const plan = await SubscriptionPlan.findByIdAndDelete(req.params.id);
        if (!plan) return errorResponse(res, 404, "Subscription plan not found!");

        successResponse(res, "Subscription plan deleted successfully!");
    } catch (error) {
        next(error);
    }
};
