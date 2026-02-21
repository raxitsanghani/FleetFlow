const express = require('express');
const {
    getAllDrivers,
    getDriverById,
    createDriver,
    updateDriver
} = require('../controllers/driver.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', getAllDrivers);
router.get('/:id', getDriverById);
router.post('/', authorize('FLEET_MANAGER', 'SAFETY_OFFICER'), createDriver);
router.put('/:id', authorize('FLEET_MANAGER', 'SAFETY_OFFICER'), updateDriver);

module.exports = router;
