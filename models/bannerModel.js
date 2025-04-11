const mongoose = require("mongoose");

const BannerSchema = new mongoose.Schema({
    imageUrl: { 
        type: String, 
        required: true 
    },
    publicId: { 
        type: String, 
        required: true,
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
