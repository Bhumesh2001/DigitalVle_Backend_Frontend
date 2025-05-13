const express = require("express");
const router = express.Router();
const termsController = require("../controllers/termsController");
const authenticate = require('../middlewares/authMiddleware');

router.post("/", authenticate('admin'), termsController.createOrUpdateTerms);
router.get("/", termsController.getTerm);

module.exports = router;
