const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
            maxlength: 254,
            index: true
        },
        phone: {
            type: String,
            required: true,
            match: [/^\+?[\d\s\-]{10,15}$/, "Invalid phone number"],
            index: true,
            // unique: true,
            maxlength: 15
        },
        city: {
            type: String,
            trim: true,
            maxlength: 50
        },
        district: {
            type: String,
            trim: true,
            maxlength: 50
        },
        state: {
            type: String,
            trim: true,
            maxlength: 50
        },
        country: {
            type: String,
            trim: true,
            default: "India",
            maxlength: 50
        },
        pincode: {
            type: String,
            required: true,
            match: [/^\d{6}$/, "Invalid pincode"],
            maxlength: 6
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        }
    },
    { timestamps: true }
);

// Compound index for location-based queries
contactSchema.index({ country: 1, state: 1, district: 1, city: 1 });

module.exports = mongoose.model("Contact", contactSchema);