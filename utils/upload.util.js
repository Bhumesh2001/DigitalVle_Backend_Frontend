const cron = require("node-cron");
const fs = require("fs");
const path = require("path");

const uploadsDir = path.join(__dirname, "uploads");

// Run every day at midnight
cron.schedule("0 0 * * *", async () => {
    console.log("Checking uploads directory...");

    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            console.error("Error reading uploads directory:", err);
            return;
        }

        if (files.length === 0) {
            console.log("No files found in uploads directory.");
            return;
        }

        files.forEach((file) => {
            const filePath = path.join(uploadsDir, file);

            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Error deleting file ${file}:`, err);
                } else {
                    console.log(`Deleted file: ${file}`);
                }
            });
        });
    });
});
