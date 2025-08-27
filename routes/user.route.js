const express = require("express");
const userController = require("../controllers/user.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const {
    createUserValidator,
    loginAdminValidator,
    UpdateUserValidator
} = require("../validators/validation");
const validate = require("../middlewares/validate.middleware");

const router = express.Router();

router.post("/register", createUserValidator, validate, userController.registerUser);
router.post("/login", loginAdminValidator, validate, userController.loginUser);
router.post("/logout", authenticate(["user"]), userController.logoutUser);

// Verify Email Routes
router.post("/resend-email-otp", userController.resendEmailOtp);
router.post("/verify-email-otp", userController.verifyEmailOtp);

// Google OAuth Routes
router.get("/google", userController.redirectToGoogleProfile);
router.get("/google/callback", userController.getGoogleProfile);
router.post("/google/login", userController.loginWithGoogle);

// Forgot Password (Send OTP)
router.post("/forgot-password", userController.forgotPassword);
router.post("/resend-otp", userController.resendOTP);
router.post("/verify-otp", userController.verifyOtp);
router.post("/reset-password", userController.resetPassword);

// Get And Update Profile
router.get("/profile", authenticate(["user"]), userController.getProfile);
router.put(
    "/profile",
    authenticate(["user"]),
    UpdateUserValidator,
    validate,
    userController.updateProfile
);

module.exports = router;
