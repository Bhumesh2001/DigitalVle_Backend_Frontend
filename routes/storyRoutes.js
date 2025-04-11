const express = require("express");
const storyController = require("../controllers/storyController");
const authenticate = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authenticate('user'), storyController.createStory); // ✅ Create Story
router.get("/", authenticate('user'), storyController.getStories);  // ✅ Get All Stories
router.get("/:id", authenticate('user'), storyController.getStoryById);  // ✅ Get Single Story
router.put("/:id", authenticate('user'), storyController.updateStory); // ✅ Update Story
router.delete("/:id", authenticate('user'), storyController.deleteStory);  // ✅ Delete Story

module.exports = router;
