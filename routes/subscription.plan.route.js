const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const subscriptionPlanController = require("../controllers/subscription.plan.controller");

const { createOrUpdateSubscriptionPlanValidator } = require("../validators/validation");
const validate = require("../middlewares/validate.middleware");

//  Routes
router.get("/", authenticate(["user", "admin"]), subscriptionPlanController.getAllSubscriptionPlans);
router.get("/:id", authenticate(["user", "admin"]), subscriptionPlanController.getSubscriptionPlanById);

// Admin Routes (Protected)
router.post(
    "/",
    authenticate(["admin"]),
    createOrUpdateSubscriptionPlanValidator,
    validate,
    subscriptionPlanController.createSubscriptionPlan
);
router.put(
    "/:id",
    authenticate(["admin"]),
    createOrUpdateSubscriptionPlanValidator,
    validate,
    subscriptionPlanController.updateSubscriptionPlan
);
router.delete("/:id", authenticate(["admin"]), subscriptionPlanController.deleteSubscriptionPlan);

module.exports = router;
