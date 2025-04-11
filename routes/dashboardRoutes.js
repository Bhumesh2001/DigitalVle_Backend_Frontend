const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authenticate = require('../middlewares/authMiddleware');

router.get('/summary', authenticate('admin'), dashboardController.getDashboardSummary);
router.get('/user-analytics', authenticate('admin'), dashboardController.getUserAnalytics);

module.exports = router;
