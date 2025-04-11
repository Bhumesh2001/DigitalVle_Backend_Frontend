const express = require("express");
const likeCommentController = require("../controllers/likeCommentController");
const authenticate = require("../middlewares/authMiddleware");

const router = express.Router();

// ✅ Like & Unlike Routes
router.post("/like", authenticate('user'), likeCommentController.likeContent);
router.post("/unlike", authenticate('user'), likeCommentController.unlikeContent);

// ✅ Comment Routes
router.post("/comment", authenticate('user'), likeCommentController.addComment);
router.get("/comments/:contentId", likeCommentController.getComments);
router.put("/comment/:commentId", authenticate('user'), likeCommentController.editComment);
router.delete("/comment/:commentId", authenticate('user'), likeCommentController.deleteComment);

module.exports = router;
