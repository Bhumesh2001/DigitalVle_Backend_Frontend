const express = require("express");
const adminController = require("../controllers/adminController");
const authenticate  = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", adminController.registerAdmin);
router.post("/login", adminController.loginAdmin);
router.get("/profile", authenticate('admin'), adminController.getAdminProfile);
router.put("/profile", authenticate('admin'), adminController.updateProfile);
router.post("/logout", authenticate('admin'), adminController.logoutAdmin);

module.exports = router;
