const express = require("express");
const videoController = require("../controllers/video.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const { createOrUpdateVideoValidator } = require("../validators/validation");
const validate = require("../middlewares/validate.middleware");

const router = express.Router();

// ✅ User Routes (Requires Authentication)
router.get("/user", authenticate(["user"]), videoController.getVideos);
router.get("/user/search", authenticate(["user"]), videoController.searchVideos);
router.get("/user/:id", authenticate(["user"]), videoController.getVideoById);

// ✅ User Routes (Requires Authentication)
router.get("/user/category/:categoryId", authenticate(["user"]), videoController.getVideosByCategory);
router.get("/user/related/:videoId", authenticate(["user"]), videoController.getRelatedVideos);

// ✅ Admin Routes (Requires Admin Authentication)
router.post(
    "/admin",
    authenticate(["admin"]),
    createOrUpdateVideoValidator,
    validate,
    videoController.createVideo
);
router.put(
    "/admin/:id",
    authenticate(["admin"]),
    createOrUpdateVideoValidator,
    validate,
    videoController.updateVideo
);
router.delete("/admin/:id", authenticate(["admin"]), videoController.deleteVideo);
router.get("/admin", authenticate(["admin"]), videoController.getAdminVideos);
router.get("/admin/:id", authenticate(["admin"]), videoController.getAdminVideoById);

module.exports = router;
