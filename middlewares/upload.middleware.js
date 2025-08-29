const multer = require("multer");
const path = require("path");
const fs = require('fs');

// ✅ Ensure uploads folder exists
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

// Store files temporarily in "uploads/" folder
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // temp folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // unique filename
    }
});

const upload = multer({ storage });

module.exports = upload;
