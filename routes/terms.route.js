const express = require("express");
const router = express.Router();
const termsController = require("../controllers/terms.controller");
const { authenticate } = require('../middlewares/auth.middleware');

const { createOrUpdateTermsValidator } = require("../validators/validation");
const validate = require("../middlewares/validate.middleware");

router.post(
    "/",
    authenticate(["admin"]),
    createOrUpdateTermsValidator,
    validate,
    termsController.createOrUpdateTerms
);
router.get("/", authenticate(["user", "admin"]), termsController.getTerm);

module.exports = router;
