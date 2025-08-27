const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            index: true,
        },
        description: {
            type: String,
            trim: true
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
            ref: 'Admin',
            index: true,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('AdminArticle', articleSchema);
