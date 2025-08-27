const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            unique: true,
        },
        price: {
            type: Number,
            min: [0, "Price cannot be negative"],
        },
        duration: {
            type: String,
            enum: ["monthly", "quarterly", "yearly"],
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
            index: true,
        },
        features: {
            type: [String], // Array of feature descriptions
            default: [],
        },
    },
    { timestamps: true }
);

const SubscriptionPlan = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
module.exports = SubscriptionPlan;
