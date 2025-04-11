const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const authenticate = require('../middlewares/authMiddleware');

router.post("/", authenticate('admin'), categoryController.createCategory);
router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategoryById);
router.put("/:id", authenticate('admin'), categoryController.updateCategory);
router.delete("/:id", authenticate('admin'), categoryController.deleteCategory);

module.exports = router;
