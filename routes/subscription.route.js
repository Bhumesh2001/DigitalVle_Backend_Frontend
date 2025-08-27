const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscription.controller");
const { authenticate } = require('../middlewares/auth.middleware');

const { createSubscriptionValidator } = require("../validators/validation");
const validate = require("../middlewares/validate.middleware");

// ✅ Create Razorpay Order
router.post("/create-order", authenticate(["user"]), subscriptionController.createOrder);

// ✅ Subscribe to a Plan
router.post(
    "/subscribe",
    authenticate(["user"]),
    createSubscriptionValidator,
    validate,
    subscriptionController.subscribe
);

// ✅ Get User's Subscriptions
router.get("/user/:userId", authenticate(["user"]), subscriptionController.getSubscriptions);

// ✅ Cancel Subscription
router.put("/cancel/:id", authenticate(["user"]), subscriptionController.cancelSubscription);

// ✅ Cancel Subscription
router.get("/admin", authenticate(["admin"]), subscriptionController.getAllSubscriptions);

module.exports = router;
