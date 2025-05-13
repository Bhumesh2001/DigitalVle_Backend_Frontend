const mongoose = require("mongoose");

const termsSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const Terms = mongoose.model("Terms", termsSchema);
module.exports = Terms;
