const Maintenance = require('../models/Maintenance');
const Vehicle = require('../models/Vehicle');
const mongoose = require('mongoose');

const logMaintenance = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { vehicleId, description, cost, date } = req.body;

        // Reject past dates
        const serviceDate = new Date(date);
        serviceDate.setHours(0, 0, 0, 0);

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const tomorrowStart = new Date(todayStart);
        tomorrowStart.setDate(tomorrowStart.getDate() + 1);

        if (serviceDate < todayStart) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: 'Service date cannot be in the past' });
        }

        const maintenance = await Maintenance.create([{
            vehicleId,
            description,
            cost,
            date: new Date(date)
        }], { session });

        // Only lock vehicle immediately if service is TODAY —
        // future-dated maintenance will be picked up when the day arrives
        const isToday = serviceDate >= todayStart && serviceDate < tomorrowStart;
        if (isToday) {
            await Vehicle.findByIdAndUpdate(vehicleId, { status: 'IN_SHOP' }, { session });
        }

        await session.commitTransaction();
        res.status(201).json(maintenance[0]);
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ error: error.message });
    } finally {
        session.endSession();
    }
};

const updateMaintenance = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;
        const data = req.body;

        const oldLog = await Maintenance.findById(id).session(session);
        if (!oldLog) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ error: 'Maintenance record not found' });
        }

        // Reject past dates if date is being changed
        if (data.date) {
            const serviceDate = new Date(data.date);
            serviceDate.setHours(0, 0, 0, 0);
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            if (serviceDate < todayStart) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ error: 'Service date cannot be in the past' });
            }
        }

        const log = await Maintenance.findByIdAndUpdate(id, data, { new: true, session });

        // Logic to update vehicle status based on the NEW date vs OLD date
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const tomorrowStart = new Date(todayStart);
        tomorrowStart.setDate(tomorrowStart.getDate() + 1);

        const vehicleId = log.vehicleId;
        const newDate = new Date(log.date);
        const isNowToday = newDate >= todayStart && newDate < tomorrowStart;

        if (isNowToday) {
            await Vehicle.findByIdAndUpdate(vehicleId, { status: 'IN_SHOP' }, { session });
        } else {
            // If it's no longer today, check if any OTHER logs for today exist
            const otherToday = await Maintenance.findOne({
                _id: { $ne: id },
                vehicleId,
                date: { $gte: todayStart, $lt: tomorrowStart }
            }).session(session);

            if (!otherToday) {
                await Vehicle.findByIdAndUpdate(vehicleId, { status: 'AVAILABLE' }, { session });
            }
        }

        await session.commitTransaction();
        res.json(log);
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ error: error.message });
    } finally {
        session.endSession();
    }
};

const deleteMaintenance = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;
        const log = await Maintenance.findById(id).session(session);
        if (!log) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ error: 'Maintenance record not found' });
        }

        const vehicleId = log.vehicleId;
        await Maintenance.findByIdAndDelete(id).session(session);

        // Check if we should revert vehicle status
        const vehicle = await Vehicle.findById(vehicleId).session(session);
        if (vehicle && vehicle.status === 'IN_SHOP') {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const tomorrowStart = new Date(todayStart);
            tomorrowStart.setDate(tomorrowStart.getDate() + 1);

            // Are there any OTHER maintenance logs for today?
            const remainingToday = await Maintenance.findOne({
                vehicleId,
                date: { $gte: todayStart, $lt: tomorrowStart }
            }).session(session);

            if (!remainingToday) {
                await Vehicle.findByIdAndUpdate(vehicleId, { status: 'AVAILABLE' }, { session });
            }
        }

        await session.commitTransaction();
        res.json({ message: 'Maintenance record deleted successfully' });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ error: error.message });
    } finally {
        session.endSession();
    }
};

const getAllMaintenances = async (req, res) => {
    try {
        const logs = await Maintenance.find()
            .populate('vehicleId')
            .sort({ date: -1 });

        const transformedLogs = logs.map(log => ({
            ...log.toObject(),
            vehicle: log.vehicleId,
            id: log._id
        }));

        res.json(transformedLogs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { logMaintenance, updateMaintenance, deleteMaintenance, getAllMaintenances };
