const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            index: true, // Index for fast search
        },
        description: {
            type: String,
            trim: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            index: true,
        },
        thumbnailUrl: {
            type: String,
        },
        thumbnailPublicId: {
            type: String,
            index: true,
        },
        videoUrl: {
            type: String,
        },
        videoPublicId: {
            type: String,
            index: true,
        },
        tags: [{ type: String }],
    },
    { timestamps: true } // Automatically adds createdAt and updatedAt
);

// Compound Index for optimized search queries
videoSchema.index({ title: "text", category: 1 });

const Video = mongoose.model("Video", videoSchema);
module.exports = Video;
