const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const FuelLog = require('../models/FuelLog');
const mongoose = require('mongoose');

const createTrip = async (req, res) => {
    try {
        const { vehicleId, driverId, startOdometer, cargoWeight } = req.body;

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle || vehicle.status !== 'AVAILABLE') {
            return res.status(400).json({ error: 'Vehicle is not available' });
        }

        if (cargoWeight > vehicle.maxCapacity) {
            return res.status(400).json({ error: `Cargo weight (${cargoWeight}kg) exceeds vehicle max capacity (${vehicle.maxCapacity}kg)` });
        }

        const driver = await Driver.findById(driverId);
        if (!driver || driver.status !== 'ON_DUTY') {
            return res.status(400).json({ error: 'Driver is not on duty' });
        }

        const trip = await Trip.create({ vehicleId, driverId, startOdometer, cargoWeight });
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
        if (trip.status !== 'DRAFT') throw new Error('Trip is not in draft status');

        trip.status = 'DISPATCHED';
        await trip.save({ session });

        await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: 'ON_TRIP' }, { session });
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
        const { endOdometer, revenue, fuelLiters, fuelCost } = req.body;

        const trip = await Trip.findById(id).session(session);
        if (!trip) throw new Error('Trip not found');

        if (Number(endOdometer) < trip.startOdometer) {
            throw new Error('End odometer cannot be less than start odometer');
        }

        trip.status = 'COMPLETED';
        trip.endOdometer = Number(endOdometer);
        trip.revenue = Number(revenue);
        await trip.save({ session });

        await Vehicle.findByIdAndUpdate(trip.vehicleId, {
            status: 'AVAILABLE',
            odometer: Number(endOdometer)
        }, { session });

        await Driver.findByIdAndUpdate(trip.driverId, { status: 'ON_DUTY' }, { session });

        // Commit the core trip first
        await session.commitTransaction();
        session.endSession();

        // Create FuelLog OUTSIDE transaction (works on standalone MongoDB too)
        if (fuelLiters && fuelCost) {
            try {
                await FuelLog.create({
                    vehicleId: trip.vehicleId,
                    tripId: trip._id,
                    liters: Number(fuelLiters),
                    cost: Number(fuelCost),
                    date: new Date()
                });
            } catch (fuelErr) {
                console.error('FuelLog creation failed:', fuelErr.message);
            }
        }

        res.json({ message: 'Trip completed', trip });
    } catch (error) {
        try { await session.abortTransaction(); } catch (_) { }
        try { session.endSession(); } catch (_) { }
        res.status(400).json({ error: error.message });
    }
};

const updateTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const trip = await Trip.findById(id);
        if (!trip) return res.status(404).json({ error: 'Trip not found' });

        // Block updates if already dispatched/completed unless it's just minor cargo change?
        // Usually safer to only allow editing DRAFT trips.
        if (trip.status !== 'DRAFT') {
            return res.status(400).json({ error: 'Only draft trips can be edited' });
        }

        if (data.cargoWeight || data.vehicleId) {
            const vId = data.vehicleId || trip.vehicleId;
            const weight = data.cargoWeight || trip.cargoWeight;
            const vehicle = await Vehicle.findById(vId);
            if (vehicle && weight > vehicle.maxCapacity) {
                return res.status(400).json({ error: `Cargo weight (${weight}kg) exceeds vehicle max capacity (${vehicle.maxCapacity}kg)` });
            }
        }

        const updatedTrip = await Trip.findByIdAndUpdate(id, data, { new: true });
        res.json(updatedTrip);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteTrip = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;
        const trip = await Trip.findById(id).session(session);
        if (!trip) return res.status(404).json({ error: 'Trip not found' });

        // If trip was already DISPATCHED, we need to free the vehicle/driver
        if (trip.status === 'DISPATCHED') {
            await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: 'AVAILABLE' }, { session });
            await Driver.findByIdAndUpdate(trip.driverId, { status: 'ON_DUTY' }, { session });
        }

        // Delete associated fuel logs
        await FuelLog.deleteMany({ tripId: id }).session(session);

        await Trip.findByIdAndDelete(id).session(session);
        await session.commitTransaction();
        res.json({ message: 'Trip deleted successfully' });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ error: error.message });
    } finally {
        session.endSession();
    }
};

const getAllTrips = async (req, res) => {
    try {
        const trips = await Trip.find()
            .populate('vehicleId', 'name licensePlate type')
            .populate('driverId', 'name licenseNumber')
            .sort({ createdAt: -1 });

        const transformed = trips.map(t => ({
            ...t.toObject(),
            vehicle: t.vehicleId,
            driver: t.driverId,
        }));

        res.json(transformed);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createTrip, dispatchTrip, completeTrip, updateTrip, deleteTrip, getAllTrips };
