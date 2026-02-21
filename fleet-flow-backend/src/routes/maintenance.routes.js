const express = require('express');
const {
    logMaintenance,
    updateMaintenance,
    deleteMaintenance,
    getAllMaintenances
} = require('../controllers/maintenance.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', getAllMaintenances);
router.post('/', authorize('FLEET_MANAGER', 'DISPATCHER'), logMaintenance);
router.put('/:id', authorize('FLEET_MANAGER', 'DISPATCHER'), updateMaintenance);
router.delete('/:id', authorize('FLEET_MANAGER'), deleteMaintenance);

module.exports = router;
