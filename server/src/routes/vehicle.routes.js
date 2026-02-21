const express = require('express');
const {
    getAllVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle
} = require('../controllers/vehicle.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', getAllVehicles);
router.get('/:id', getVehicleById);
router.post('/', authorize('FLEET_MANAGER'), createVehicle);
router.put('/:id', authorize('FLEET_MANAGER'), updateVehicle);
router.delete('/:id', authorize('FLEET_MANAGER'), deleteVehicle);

module.exports = router;
