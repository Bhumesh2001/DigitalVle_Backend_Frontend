const express = require("express");
const articleController = require("../controllers/article.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const { createOrUpdateArticleValidator } = require("../validators/validation");
const validate = require("../middlewares/validate.middleware");

const router = express.Router();

// ✅ CRUD Routes for Articles
router.post(
    "/",
    authenticate(["user"]),
    createOrUpdateArticleValidator,
    validate,
    articleController.createArticle
); // Create
router.get("/", authenticate(["user", "admin"]), articleController.getAllArticles); // Get All
router.get("/:id", authenticate(["user", "admin"]), articleController.getArticleById); // Get Single
router.put(
    "/:id",
    authenticate(["user"]),
    createOrUpdateArticleValidator,
    validate,
    articleController.updateArticle
); // Update
router.delete("/:id", authenticate(["user"]), articleController.deleteArticle); // Delete

module.exports = router;
