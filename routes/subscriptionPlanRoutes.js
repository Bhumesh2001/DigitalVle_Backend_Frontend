const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authMiddleware");
const subscriptionPlanController = require("../controllers/subscriptionPlanController");

// Public Routes
router.get("/", subscriptionPlanController.getAllSubscriptionPlans);
router.get("/:id", subscriptionPlanController.getSubscriptionPlanById);

// Admin Routes (Protected)
router.post("/", authenticate('admin'), subscriptionPlanController.createSubscriptionPlan);
router.put("/:id", authenticate('admin'), subscriptionPlanController.updateSubscriptionPlan);
router.delete("/:id", authenticate('admin'), subscriptionPlanController.deleteSubscriptionPlan);

module.exports = router;
