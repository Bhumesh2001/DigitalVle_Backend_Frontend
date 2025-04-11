const express = require("express");
const router = express.Router();
const bannerController = require("../controllers/bannerController");
const authenticate = require('../middlewares/authMiddleware');

router.post("/", authenticate('admin'), bannerController.createBanner);
router.get("/", bannerController.getAllBanners);
router.get("/:id", bannerController.getBannerById);
router.put("/:id", authenticate('admin'), bannerController.updateBanner);
router.delete("/:id", authenticate('admin'), bannerController.deleteBanner);

module.exports = router;
