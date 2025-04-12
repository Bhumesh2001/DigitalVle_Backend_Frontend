const express = require('express');
const pageController = require('../controllers/pageController');
const router = express.Router();

// Define routes for each page
router.get("/", pageController.renderIndex);
router.get("/article", pageController.renderArticle);
router.get("/banner", pageController.renderBanner);
router.get("/category", pageController.renderCategory);
router.get("/coupon", pageController.renderCoupon);
router.get("/dashboard", pageController.renderDashboard);
router.get("/logout", pageController.renderLogout);
router.get("/profile", pageController.renderProfile);
router.get("/setting", pageController.renderSetting);
router.get("/story", pageController.renderStory);
router.get("/subscription", pageController.renderSubscription);
router.get("/term", pageController.renderTerm);
router.get("/user", pageController.renderUser);
router.get("/video", pageController.renderVideo);

module.exports = router;