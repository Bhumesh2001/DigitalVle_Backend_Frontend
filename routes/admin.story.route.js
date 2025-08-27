const express = require("express");
const router = express.Router();
const storyController = require("../controllers/admin.story.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const { createOrUpdateStoryValidator } = require("../validators/validation");
const validate = require("../middlewares/validate.middleware");

router.post(
    "/",
    authenticate(["admin"]),
    createOrUpdateStoryValidator,
    validate,
    storyController.createStory
);
router.get("/", storyController.getAllStories);
router.get("/:id", authenticate(["admin"]), storyController.getStory);
router.put(
    "/:id",
    authenticate(["admin"]),
    createOrUpdateStoryValidator,
    validate,
    storyController.updateStory
);
router.delete("/:id", authenticate(["admin"]), storyController.deleteStory);

module.exports = router;
