const express = require("express");
const router = express.Router();
const settingController = require("../controllers/settingController");
const authenticate = require("../middlewares/authMiddleware");

// Only admin access
router.post("/", authenticate("admin"), settingController.upsertSetting);         // Create or update
router.get("/", authenticate("admin"), settingController.getAllSettings);        // Get all
router.get("/:key", authenticate("admin"), settingController.getSettingByKey);   // Get one

module.exports = router;
