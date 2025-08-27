const express = require("express");
const likeCommentController = require("../controllers/like.comment.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

// ✅ Like & Unlike Routes
router.post("/like", authenticate(["user"]), likeCommentController.likeContent);
router.post("/unlike", authenticate(["user"]), likeCommentController.unlikeContent);

// ✅ Comment Routes
router.post("/comment", authenticate(["user"]), likeCommentController.addComment);
router.get("/comments/:contentId", authenticate(["user", "admin"]), likeCommentController.getComments);
router.put("/comment/:commentId", authenticate(["user"]), likeCommentController.editComment);
router.delete("/comment/:commentId", authenticate(["user"]), likeCommentController.deleteComment);

module.exports = router;
