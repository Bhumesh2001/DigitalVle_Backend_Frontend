const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Plan name is required"],
            trim: true,
            unique: true,
        },
        price: {
            type: Number,
            required: [true, "Plan price is required"],
            min: [0, "Price cannot be negative"],
        },
        duration: {
            type: String,
            enum: ["monthly", "quarterly", "yearly"],
            required: [true, "Duration is required"],
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
