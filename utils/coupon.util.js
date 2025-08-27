const cron = require("node-cron");
const Coupon = require("../models/coupon.model");

// Runs daily at midnight
cron.schedule("0 0 * * *", async () => {
    try {
        await Coupon.deleteMany({ expiryDate: { $lt: new Date() } });
        // console.log("Expired coupons removed successfully!");
    } catch (error) {
        console.error("Error deleting expired coupons:", error);
    }
});
