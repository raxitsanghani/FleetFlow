const express = require('express');
const { logFuel, getAllFuelLogs } = require('../controllers/fuel.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', getAllFuelLogs);
router.post('/', authorize('FLEET_MANAGER', 'DISPATCHER'), logFuel);

module.exports = router;
