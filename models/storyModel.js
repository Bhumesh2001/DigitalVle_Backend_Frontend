const mongoose = require("mongoose");

const storySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        caption: {
            type: String,
            trim: true,
        },
        imageUrl: {
            type: String,
            required: true,
            trim: true,
        },
        publicId: {
            type: String,
            required: true,
            index: true,
        },
        expiredTime: {
            type: Date,
            default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
            index: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        isExpired: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    { timestamps: true }
);

// ✅ Automatically mark expired stories
storySchema.pre("save", function (next) {
    if (!this.expiredTime) {
        this.expiredTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }
    next();
});

// ✅ Indexing for optimized querying
storySchema.index({ createdBy: 1, expiredTime: 1 });

const Story = mongoose.model("Story", storySchema);
module.exports = Story;
