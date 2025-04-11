const express = require("express");
const router = express.Router();
const storyController = require("../controllers/adminStoryController");
const authenticate = require("../middlewares/authMiddleware");

router.post("/", authenticate('admin'), storyController.createStory);
router.get("/", storyController.getAllStories);
router.get("/:id", authenticate('admin'), storyController.getStory);
router.put("/:id", authenticate('admin'), storyController.updateStory);
router.delete("/:id", authenticate('admin'), storyController.deleteStory);

module.exports = router;
