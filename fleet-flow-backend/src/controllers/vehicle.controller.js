const prisma = require('../config/db');

const getAllVehicles = async (req, res) => {
    try {
        const vehicles = await prisma.vehicle.findMany({
            where: { deletedAt: null },
            include: {
                _count: {
                    select: { trips: true, maintenances: true, fuelLogs: true }
                }
            }
        });
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getVehicleById = async (req, res) => {
    try {
        const { id } = req.params;
        const vehicle = await prisma.vehicle.findUnique({
            where: { id },
            include: {
                trips: true,
                maintenances: true,
                fuelLogs: true
            }
        });
        if (!vehicle || vehicle.deletedAt) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }
        res.json(vehicle);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createVehicle = async (req, res) => {
    try {
        const { name, licensePlate, type, maxCapacity, odometer, acquisitionCost } = req.body;

        const existing = await prisma.vehicle.findUnique({ where: { licensePlate } });
        if (existing) {
            return res.status(400).json({ error: 'License plate already exists' });
        }

        const vehicle = await prisma.vehicle.create({
            data: { name, licensePlate, type, maxCapacity, odometer, acquisitionCost }
        });
        res.status(201).json(vehicle);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const vehicle = await prisma.vehicle.update({
            where: { id },
            data
        });
        res.json(vehicle);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.vehicle.update({
            where: { id },
            data: { deletedAt: new Date(), status: 'RETIRED' }
        });
        res.json({ message: 'Vehicle soft-deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    getAllVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle
};
