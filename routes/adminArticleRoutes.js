const express = require('express');
const router = express.Router();
const articleController = require('../controllers/adminArticleController');
const authenticate = require('../middlewares/authMiddleware');

// Create
router.post('/', authenticate('admin'), articleController.createArticle);
router.get('/', authenticate('admin'), articleController.getAllArticles);
router.get("/:id", authenticate('admin'), articleController.getSingleArticle);
router.put('/:id', authenticate('admin'), articleController.updateArticle);
router.delete('/:id', authenticate('admin'), articleController.deleteArticle);

module.exports = router;
