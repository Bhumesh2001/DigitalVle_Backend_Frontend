const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true, // for faster search
    },
    password: {
        type: String,
        minlength: 6,
        select: false,
    },
    mobileNumber: {
        type: String,
        match: [/^\d{10}$/, "Invalid mobile number"],
        default: null,
        index: true,
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
        index: true,
    },
    dob: {
        type: Date,
    },
    role: {
        type: String,
        enum: ["user"],
        default: "user",
    },
    profileUrl: {
        type: String,
    },
    publicId: {
        type: String,
        default: null,
        index: true,
    },
    resetOtp: {
        type: String,
        select: false,
    },
    otpExpires: {
        type: Date,
        select: false,
    },
    otpVerified: {
        type: Boolean,
        default: false,
        select: false,
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
        index: true,
    },
}, {
    timestamps: true
});

// 🔐 Pre-save middleware for password hashing
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
