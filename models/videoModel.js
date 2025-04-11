const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            index: true, // Index for fast search
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
            index: true,
        },
        thumbnailUrl: {
            type: String,
            required: true,
        },
        thumbnailPublicId: {
            type: String,
            required: true,
            index: true,
        },
        videoUrl: {
            type: String,
            required: true,
        },
        videoPublicId: {
            type: String,
            required: true,
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
