const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contact.controller");
const { authenticate } = require('../middlewares/auth.middleware');

const { createContactValidator } = require("../validators/validation");
const validate = require("../middlewares/validate.middleware");

router.post(
    "/submit",
    createContactValidator,
    validate,
    contactController.submitContactForm
);
router.get("/", authenticate(["admin"]), contactController.getAllContacts);
router.get("/:id", authenticate(["admin"]), contactController.getContactById);
router.delete("/:id", authenticate(["admin"]), contactController.deleteContact);

module.exports = router;
