const mongoose = require("mongoose");

// ✅ Like Schema
const likeSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        contentId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true
        }, // Can be article, story, etc.
        contentType: {
            type: String,
            enum: ["article", "story", "comment", "video"],
            required: true
        }, // To differentiate between different models
    },
    { timestamps: true }
);

// ✅ Indexing for Faster Queries
likeSchema.index({ contentId: 1, userId: 1 }, { unique: true }); // Prevent duplicate likes

const Like = mongoose.model("Like", likeSchema);
module.exports = Like;
