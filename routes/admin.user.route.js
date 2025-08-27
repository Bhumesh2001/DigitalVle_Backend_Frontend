const express = require("express");
const router = express.Router();
const userController = require("../controllers/admin.user.controller");
const { authenticate } = require('../middlewares/auth.middleware');

const { createUserValidator, updateUserValidator } = require("../validators/validation");
const validate = require("../middlewares/validate.middleware");

// Only accessible by Admin
router.post(
    "/", 
    authenticate(["admin"]),
    createUserValidator,
    validate,
    userController.createUser
);
router.get("/", authenticate(["admin"]), userController.getAllUsers);
router.get("/:id", authenticate(["admin"]), userController.getUserById);
router.put(
    "/:id", 
    authenticate(["admin"]), 
    updateUserValidator,
    validate,
    userController.updateUser
);
router.delete("/:id", authenticate(["admin"]), userController.deleteUser);

module.exports = router;
