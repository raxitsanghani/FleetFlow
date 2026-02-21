const prisma = require('../config/db');

const logMaintenance = async (req, res) => {
    try {
        const { vehicleId, description, cost, date } = req.body;

        const maintenance = await prisma.$transaction(async (tx) => {
            const log = await tx.maintenance.create({
                data: { vehicleId, description, cost, date: new Date(date) }
            });

            await tx.vehicle.update({
                where: { id: vehicleId },
                data: { status: 'IN_SHOP' }
            });

            return log;
        });

        res.status(201).json(maintenance);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAllMaintenances = async (req, res) => {
    try {
        const logs = await prisma.maintenance.findMany({
            include: { vehicle: true },
            orderBy: { date: 'desc' }
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { logMaintenance, getAllMaintenances };
