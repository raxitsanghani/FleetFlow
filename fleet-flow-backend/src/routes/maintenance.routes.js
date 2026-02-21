const express = require('express');
const { logMaintenance, getAllMaintenances } = require('../controllers/maintenance.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', getAllMaintenances);
router.post('/', authorize('FLEET_MANAGER', 'DISPATCHER'), logMaintenance);

module.exports = router;
