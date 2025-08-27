const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const { createPaymentValidator } = require('../validators/validation');
const validate = require('../middlewares/validate.middleware');

router.post(
    '/',
    authenticate(["user"]),
    createPaymentValidator,
    validate,
    paymentController.createPayment
);
router.get('/', authenticate(["admin"]), paymentController.getAllPayments);
router.get('/user', authenticate(["user"]), paymentController.getPaymentsByUser);

module.exports = router;
