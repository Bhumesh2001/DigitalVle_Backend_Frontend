const express = require("express");
const router = express.Router();
const settingController = require("../controllers/setting.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// Only admin access
router.post("/", authenticate(["admin"]), settingController.upsertSetting);         // Create or update
router.get("/", authenticate(["admin"]), settingController.getAllSettings);        // Get all
router.get("/:key", authenticate(["admin"]), settingController.getSettingByKey);   // Get one

module.exports = router;
