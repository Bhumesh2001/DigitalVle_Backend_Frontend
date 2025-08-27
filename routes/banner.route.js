const express = require("express");
const router = express.Router();
const bannerController = require("../controllers/banner.controller");
const { authenticate } = require('../middlewares/auth.middleware');

const { createOrUpdateBannerValidator,  } = require("../validators/validation");
const validate = require("../middlewares/validate.middleware");

router.post(
    "/", 
    authenticate(["admin"]), 
    createOrUpdateBannerValidator, 
    validate, 
    bannerController.createBanner
);
router.get("/", authenticate(["user", "admin"]), bannerController.getAllBanners);
router.get("/:id", authenticate(["user", "admin"]), bannerController.getBannerById);
router.put(
    "/:id", 
    authenticate(["admin"]), 
    createOrUpdateBannerValidator,
    validate,
    bannerController.updateBanner
);
router.delete("/:id", authenticate(["admin"]), bannerController.deleteBanner);

module.exports = router;
