const FuelLog = require('../models/FuelLog');
const Trip = require('../models/Trip');
const { generateUID } = require('../utils/idGenerator');

const logFuel = async (req, res) => {
    try {
        const { vehicleId, tripId, liters, cost, date } = req.body;
        const log = await FuelLog.create({
            uid: generateUID('FUE'),
            vehicleId,
            tripId: tripId || null,
            liters,
            cost,
            date: new Date(date)
        });
        res.status(201).json(log);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateFuelLog = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        if (data.date) {
            data.date = new Date(data.date);
        }

        const log = await FuelLog.findByIdAndUpdate(id, data, { new: true });
        if (!log) return res.status(404).json({ error: 'Fuel log not found' });

        res.json(log);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteFuelLog = async (req, res) => {
    try {
        const { id } = req.params;
        const log = await FuelLog.findByIdAndDelete(id);
        if (!log) return res.status(404).json({ error: 'Fuel log not found' });

        res.json({ message: 'Fuel log deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllFuelLogs = async (req, res) => {
    try {
        const logs = await FuelLog.find()
            .populate('vehicleId')
            .populate('tripId')
            .sort({ date: -1 });

        const transformed = logs.map(log => ({
            ...log.toObject(),
            vehicle: log.vehicleId,
            trip: log.tripId,
            id: log._id
        }));

        res.json(transformed);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { logFuel, updateFuelLog, deleteFuelLog, getAllFuelLogs };
