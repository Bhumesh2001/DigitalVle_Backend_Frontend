const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
    {
        name: { 
            type: String, 
            required: true, 
            trim: true 
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        password: { 
            type: String, 
            required: true, 
            select: false 
        },
        role: { 
            type: String, 
            enum: ["superadmin", "admin"], 
            default: "admin" 
        },
        profileUrl: { type: String },
        publicId: {
            type: String,
            index: true,
        },
    },
    { timestamps: true }
);

// ✅ Hash password before saving
adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model("Admin", adminSchema);
