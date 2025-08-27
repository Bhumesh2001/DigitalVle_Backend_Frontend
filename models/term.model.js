const mongoose = require("mongoose");

const termsSchema = new mongoose.Schema({
    content: {
        type: String,
    },
}, { timestamps: true });

const Terms = mongoose.model("Terms", termsSchema);
module.exports = Terms;
