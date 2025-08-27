const express = require("express");
const router = express.Router();
const couponController = require("../controllers/coupon.controller");
const { authenticate } = require('../middlewares/auth.middleware');

const { createOrUpdateCouponValidator } = require('../validators/validation');
const validate = require('../middlewares/validate.middleware');

router.post(
    "/",
    authenticate(["admin"]),
    createOrUpdateCouponValidator,
    validate,
    couponController.createCoupon
);
router.get("/random-coupon", authenticate(["user"]), couponController.getRandomCoupon);
router.get("/", authenticate(["user", "admin"]), couponController.getCoupons);
router.get("/:id", authenticate(["user", "admin"]), couponController.getCouponById);
router.put(
    "/:id",
    authenticate(["admin"]),
    createOrUpdateCouponValidator,
    validate,
    couponController.updateCoupon
);
router.delete("/:id", authenticate(["admin"]), couponController.deleteCoupon);

module.exports = router;
