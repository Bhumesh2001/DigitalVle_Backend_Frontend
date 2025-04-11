const express = require("express");
const router = express.Router();
const userController = require("../controllers/adminUserController");
const authenticate = require('../middlewares/authMiddleware');

// Only accessible by Admin
router.post("/", authenticate('admin'), userController.createUser);
router.get("/", authenticate('admin'), userController.getAllUsers);
router.get("/:id", authenticate('admin'), userController.getUserById);
router.put("/:id", authenticate('admin'), userController.updateUser);
router.delete("/:id", authenticate('admin'), userController.deleteUser);

module.exports = router;
