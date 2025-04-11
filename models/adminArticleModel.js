const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        imageUrl: {
            type: String,
            required: true,
        },
        publicId: {
            type: String,
            required: true,
            index: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true,
            index: true,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('AdminArticle', articleSchema);
