const express = require('express');
const pageController = require('../controllers/page.controller');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');

// Middleware to attach r=admin for these routes
router.use((req, res, next) => {
    const adminRoutes = [
        "/article",
        "/banner",
        "/category",
        "/coupon",
        "/dashboard",
        "/logout",
        "/profile",
        "/setting",
        "/story",
        "/subscription",
        "/term",
        "/user",
        "/video"
    ];

    if (adminRoutes.includes(req.path) && !req.query.r) {
        req.query.r = "admin"; // inject query param
    }
    next();
});

// Define routes for each page
router.get("/", pageController.renderIndex);
router.get("/article", authenticate(["admin"]), pageController.renderArticle);
router.get("/banner", authenticate(["admin"]), pageController.renderBanner);
router.get("/category", authenticate(["admin"]), pageController.renderCategory);
router.get("/coupon", authenticate(["admin"]), pageController.renderCoupon);
router.get("/dashboard", authenticate(["admin"]), pageController.renderDashboard);
router.get("/logout", authenticate(["admin"]), pageController.renderLogout);
router.get("/profile", authenticate(["admin"]), pageController.renderProfile);
router.get("/setting", authenticate(["admin"]), pageController.renderSetting);
router.get("/story", authenticate(["admin"]), pageController.renderStory);
router.get("/subscription", authenticate(["admin"]), pageController.renderSubscription);
router.get("/term", authenticate(["admin"]), pageController.renderTerm);
router.get("/user", authenticate(["admin"]), pageController.renderUser);
router.get("/video", authenticate(["admin"]), pageController.renderVideo);

module.exports = router;
