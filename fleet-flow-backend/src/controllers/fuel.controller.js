const prisma = require('../config/db');

const logFuel = async (req, res) => {
    try {
        const { vehicleId, liters, cost, date } = req.body;
        const log = await prisma.fuelLog.create({
            data: { vehicleId, liters, cost, date: new Date(date) }
        });
        res.status(201).json(log);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAllFuelLogs = async (req, res) => {
    try {
        const logs = await prisma.fuelLog.findMany({
            include: { vehicle: true },
            orderBy: { date: 'desc' }
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { logFuel, getAllFuelLogs };
