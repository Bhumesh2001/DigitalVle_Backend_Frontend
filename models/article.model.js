const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            index: true,
        },
        description: {
            type: String,
            trim: true,
        },
        imageUrl: {
            type: String,
        },
        publicId: {
            type: String,
            index: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true,
        },
    },
    { timestamps: true }
);

articleSchema.index({ title: 1, createdBy: 1 });

const Article = mongoose.model("Article", articleSchema);
module.exports = Article;
