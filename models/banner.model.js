const mongoose = require("mongoose");

const BannerSchema = new mongoose.Schema({
    name: {
        type: String,
        index: true,
        unique: true,
    },
    imageUrl: { 
        type: String, 
    },
    publicId: { 
        type: String, 
        index: true, 
    },
    status: { 
        type: String, 
        enum: ["active", "inactive"], 
        default: "active",
        index: true,
    }
}, { timestamps: true });

const Banner = mongoose.model("Banner", BannerSchema);
module.exports = Banner;
