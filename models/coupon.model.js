const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            unique: true,
            uppercase: true,
            trim: true
        },
        discount: {
            type: Number,
        },
        type: {
            type: String,
            enum: ["percentage", "fixed"],
        },
        expiryDate: {
            type: Date,
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
