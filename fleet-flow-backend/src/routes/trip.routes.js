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
router.put('/:id/dispatch', authorize('FLEET_MANAGER', 'DISPATCHER'), dispatchTrip);
router.put('/:id/complete', authorize('FLEET_MANAGER', 'DISPATCHER'), completeTrip);

module.exports = router;
