const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const { authenticate } = require('../middlewares/auth.middleware');

const { createOrUpdateCategoryValidator } = require("../validators/validation");
const validate = require("../middlewares/validate.middleware");

router.post(
    "/",
    authenticate(["admin"]),
    createOrUpdateCategoryValidator,
    validate,
    categoryController.createCategory
);
router.get("/", authenticate(["user", "admin"]), categoryController.getCategories);
router.get("/:id", authenticate(["user", "admin"]), categoryController.getCategoryById);
router.put(
    "/:id",
    authenticate(["admin"]),
    createOrUpdateCategoryValidator,
    validate,
    categoryController.updateCategory
);
router.delete("/:id", authenticate(["admin"]), categoryController.deleteCategory);

module.exports = router;
