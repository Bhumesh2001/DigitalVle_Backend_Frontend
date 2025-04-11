const express = require("express");
const videoController = require("../controllers/videoController");
const authenticate = require("../middlewares/authMiddleware");

const router = express.Router();

// ✅ User Routes (Requires Authentication)
router.get("/user/", authenticate("user"), videoController.getVideos);
router.get("/user/:id", authenticate("user"), videoController.getVideoById);

// ✅ User Routes (Requires Authentication)
router.get("/user/category/:categoryId", authenticate("user"), videoController.getVideosByCategory);
router.get("/user/related/:videoId", authenticate("user"), videoController.getRelatedVideos);

// ✅ Admin Routes (Requires Admin Authentication)
router.post("/admin", authenticate("admin"), videoController.createVideo);
router.put("/admin/:id", authenticate("admin"), videoController.updateVideo);
router.delete("/admin/:id", authenticate("admin"), videoController.deleteVideo);
router.get("/admin", authenticate("admin"), videoController.getAdminVideos);
router.get("/admin/:id", authenticate("admin"), videoController.getAdminVideoById);

module.exports = router;
