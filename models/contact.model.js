const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            index: true
        },
        phone: {
            type: String,
            index: true,
        },
        city: {
            type: String,
            trim: true,
        },
        district: {
            type: String,
            trim: true,
        },
        state: {
            type: String,
            trim: true,
        },
        country: {
            type: String,
            trim: true,
            default: "India",
        },
        pincode: {
            type: String,
        },
        message: {
            type: String,
            trim: true,
        }
    },
    { timestamps: true }
);

// Compound index for location-based queries
contactSchema.index({ country: 1, state: 1, district: 1, city: 1 });

module.exports = mongoose.model("Contact", contactSchema);