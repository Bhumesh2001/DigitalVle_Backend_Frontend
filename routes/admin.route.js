const express = require("express");
const adminController = require("../controllers/admin.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const { createAdminValidator } = require("../validators/validation");
const validate = require("../middlewares/validate.middleware");

const router = express.Router();

router.post("/register", createAdminValidator, validate, adminController.registerAdmin);
router.post("/login", adminController.loginAdmin);
router.get("/profile", authenticate(["admin"]), adminController.getAdminProfile);
router.put("/profile", authenticate(["admin"]), adminController.updateProfile);
router.post("/logout", authenticate(["admin"]), adminController.logoutAdmin);

module.exports = router;
