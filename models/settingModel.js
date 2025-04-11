const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
    {
        key: { type: String, required: true, unique: true },
        value: { type: mongoose.Schema.Types.Mixed }, // Can hold any type
    },
    { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);
