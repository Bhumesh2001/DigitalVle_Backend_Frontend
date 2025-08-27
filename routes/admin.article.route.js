const express = require('express');
const router = express.Router();
const articleController = require('../controllers/admin.article.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const { createOrUpdateArticleValidator } = require("../validators/validation");
const validate = require("../middlewares/validate.middleware");

// Create
router.post(
    '/', 
    authenticate(["admin"]), 
    createOrUpdateArticleValidator,
    validate,
    articleController.createArticle
);
router.get('/', authenticate(["admin"]), articleController.getAllArticles);
router.get("/:id", authenticate(["admin"]), articleController.getSingleArticle);
router.put(
    '/:id', 
    authenticate(["admin"]), 
    createOrUpdateArticleValidator,
    validate,
    articleController.updateArticle
);
router.delete('/:id', authenticate(["admin"]), articleController.deleteArticle);

module.exports = router;
