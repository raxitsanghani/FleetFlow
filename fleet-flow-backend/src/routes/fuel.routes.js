const express = require('express');
const {
    logFuel,
    updateFuelLog,
    deleteFuelLog,
    getAllFuelLogs
} = require('../controllers/fuel.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', getAllFuelLogs);
router.post('/', authorize('FLEET_MANAGER', 'DISPATCHER'), logFuel);
router.put('/:id', authorize('FLEET_MANAGER', 'DISPATCHER'), updateFuelLog);
router.delete('/:id', authorize('FLEET_MANAGER'), deleteFuelLog);

module.exports = router;
