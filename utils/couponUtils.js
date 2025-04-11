const cron = require("node-cron");
const Coupon = require("../models/couponModel");

cron.schedule("0 0 * * *", async () => {  // Runs daily at midnight
    try {
        await Coupon.deleteMany({ expiryDate: { $lt: new Date() } });
        console.log("Expired coupons removed successfully!");
    } catch (error) {
        console.error("Error deleting expired coupons:", error);
    }
});
