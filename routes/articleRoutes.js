const express = require("express");
const articleController = require("../controllers/articleController");
const authenticate = require("../middlewares/authMiddleware");

const router = express.Router();

// ✅ CRUD Routes for Articles
router.post("/", authenticate('user'), articleController.createArticle); // Create
router.get("/", articleController.getAllArticles); // Get All
router.get("/:id", articleController.getArticleById); // Get Single
router.put("/:id", authenticate('user'), articleController.updateArticle); // Update
router.delete("/:id", authenticate('user'), articleController.deleteArticle); // Delete

module.exports = router;
