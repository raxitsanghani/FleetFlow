const express = require('express');
const { getDashboardStats, getVehicleAnalytics } = require('../controllers/analytics.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/dashboard', getDashboardStats);
router.get('/vehicles', authorize('FLEET_MANAGER', 'FINANCIAL_ANALYST'), getVehicleAnalytics);

module.exports = router;
