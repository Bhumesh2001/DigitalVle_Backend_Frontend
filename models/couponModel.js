const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true
        },
        discount: {
            type: Number,
            required: true
        },
        type: {
            type: String,
            enum: ["percentage", "fixed"],
            required: true
        },
        expiryDate: {
            type: Date,
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
            index: true,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
