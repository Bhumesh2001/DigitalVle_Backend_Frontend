const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
const authenticate = require('../middlewares/authMiddleware');

router.post("/", authenticate('admin'), couponController.createCoupon);
router.get("/random-coupon", authenticate("user"), couponController.getRandomCoupon);
router.get("/", couponController.getCoupons);
router.get("/:id", couponController.getCouponById);
router.put("/:id", authenticate('admin'), couponController.updateCoupon);
router.delete("/:id", authenticate('admin'), couponController.deleteCoupon);

module.exports = router;
