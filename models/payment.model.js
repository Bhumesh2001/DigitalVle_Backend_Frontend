const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    isAllCategory: {
        type: Boolean,
        default: false
    },
    imageUrl: {
        type: String,
    },
    publicId: {
        type: String,
        index: true
    }
}, {
    timestamps: true
});

// Set isAllCategory to true if categoryId is not provided
paymentSchema.pre('save', function (next) {
    if (!this.categoryId) {
        this.isAllCategory = true;
    } else {
        this.isAllCategory = false;
    }
    next();
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
