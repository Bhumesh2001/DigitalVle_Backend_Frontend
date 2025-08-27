const mongoose = require("mongoose");

// ✅ Comment Schema
const commentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true
        },
        contentId: {
            type: mongoose.Schema.Types.ObjectId,
            index: true
        }, // Can be article, story, etc.
        contentType: {
            type: String,
            enum: ["article", "story", "video", "comment", "adminarticle", "adminstory"],
            required: true
        },
        text: {
            type: String,
            trim: true
        },
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null,
            index: true
        }, // For replies (nested comments)
    },
    { timestamps: true }
);

// ✅ Indexing for Faster Queries
commentSchema.index({ contentId: 1, contentType: 1 });

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
