const express = require("express");
const storyController = require("../controllers/story.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const { createOrUpdateStoryValidator } = require("../validators/validation");
const validate = require("../middlewares/validate.middleware");

const router = express.Router();

router.post(
    "/",
    authenticate(["user"]),
    createOrUpdateStoryValidator,
    validate,
    storyController.createStory
); // ✅ Create Story
router.get("/", authenticate(["user"]), storyController.getStories);  // ✅ Get All Stories
router.get("/:id", authenticate(["user"]), storyController.getStoryById);  // ✅ Get Single Story
router.put(
    "/:id",
    authenticate(["user"]),
    createOrUpdateStoryValidator,
    validate,
    storyController.updateStory
); // ✅ Update Story
router.delete("/:id", authenticate(["user"]), storyController.deleteStory);  // ✅ Delete Story

module.exports = router;
