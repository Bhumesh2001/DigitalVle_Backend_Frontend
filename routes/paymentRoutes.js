const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authenticate = require('../middlewares/authMiddleware');

router.post('/', authenticate('user'), paymentController.createPayment);
router.get('/', authenticate('admin'), paymentController.getAllPayments);
router.get('/user', authenticate('user'), paymentController.getPaymentsByUser);

module.exports = router;
