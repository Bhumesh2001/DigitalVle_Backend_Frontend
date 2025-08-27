const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            unique: true,
            index: true, // Optimized for faster queries
        },
        imageUrl: {
            type: String,
        },
        publicId: {
            type: String,
            index: true,
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
            index: true, // Optimized for filtering
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
