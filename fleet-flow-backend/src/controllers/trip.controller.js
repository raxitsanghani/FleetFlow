const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const mongoose = require('mongoose');

const createTrip = async (req, res) => {
    try {
        const { vehicleId, driverId, cargoWeight, startOdometer } = req.body;

        // 1. Check Vehicle
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle || vehicle.status !== 'AVAILABLE' || vehicle.deletedAt) {
            return res.status(400).json({ error: 'Vehicle is not available' });
        }
        if (cargoWeight > vehicle.maxCapacity) {
            return res.status(400).json({ error: 'Cargo weight exceeds vehicle capacity' });
        }

        // 2. Check Driver
        const driver = await Driver.findById(driverId);
        if (!driver || driver.status !== 'ON_DUTY') {
            return res.status(400).json({ error: 'Driver is not on duty' });
        }
        if (new Date(driver.licenseExpiry) < new Date()) {
            return res.status(400).json({ error: 'Driver license has expired' });
        }

        // 3. Create Trip in DRAFT
        const trip = await Trip.create({
            vehicleId,
            driverId,
            cargoWeight,
            startOdometer: startOdometer || vehicle.odometer,
            status: 'DRAFT'
        });

        res.status(201).json(trip);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const dispatchTrip = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;

        const trip = await Trip.findById(id).session(session);
        if (!trip) throw new Error('Trip not found');

        // Update trip status
        trip.status = 'DISPATCHED';
        await trip.save({ session });

        // Update vehicle status
        await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: 'ON_TRIP' }, { session });

        // Update driver status
        await Driver.findByIdAndUpdate(trip.driverId, { status: 'ON_TRIP' }, { session });

        await session.commitTransaction();
        res.json({ message: 'Trip dispatched', trip });
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ error: error.message });
    } finally {
        session.endSession();
    }
};

const completeTrip = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;
        const { endOdometer, revenue } = req.body;

        const trip = await Trip.findById(id).session(session);
        if (!trip) throw new Error('Trip not found');

        if (endOdometer < trip.startOdometer) {
            throw new Error('End odometer cannot be less than start odometer');
        }

        // Update trip
        trip.status = 'COMPLETED';
        trip.endOdometer = endOdometer;
        trip.revenue = revenue;
        await trip.save({ session });

        // Update vehicle
        await Vehicle.findByIdAndUpdate(trip.vehicleId, {
            status: 'AVAILABLE',
            odometer: endOdometer
        }, { session });

        // Update driver
        await Driver.findByIdAndUpdate(trip.driverId, { status: 'ON_DUTY' }, { session });

        await session.commitTransaction();
        res.json({ message: 'Trip completed', trip });
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ error: error.message });
    } finally {
        session.endSession();
    }
};

const getAllTrips = async (req, res) => {
    try {
        const trips = await Trip.find()
            .populate('vehicleId')
            .populate('driverId')
            .sort({ createdAt: -1 });

        // Map to match frontend expectations if needed (transforming vehicleId to vehicle object)
        const transformedTrips = trips.map(t => ({
            ...t.toObject(),
            vehicle: t.vehicleId,
            driver: t.driverId,
            id: t._id
        }));

        res.json(transformedTrips);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createTrip,
    dispatchTrip,
    completeTrip,
    getAllTrips
};
