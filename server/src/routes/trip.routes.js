const express = require('express');
const {
    createTrip,
    dispatchTrip,
    completeTrip,
    getAllTrips
} = require('../controllers/trip.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', getAllTrips);
router.post('/', authorize('FLEET_MANAGER', 'DISPATCHER'), createTrip);
router.patch('/:id/dispatch', authorize('FLEET_MANAGER', 'DISPATCHER'), dispatchTrip);
router.patch('/:id/complete', authorize('FLEET_MANAGER', 'DISPATCHER'), completeTrip);

module.exports = router;
