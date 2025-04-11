const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const authenticate = require('../middlewares/authMiddleware');

router.post("/submit", contactController.submitContactForm);
router.get("/", authenticate('admin'), contactController.getAllContacts);
router.get("/:id", authenticate('admin'), contactController.getContactById);
router.delete("/:id", authenticate('admin'), contactController.deleteContact);

module.exports = router;
