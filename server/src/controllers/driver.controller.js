const prisma = require('../config/db');

const getAllDrivers = async (req, res) => {
    try {
        const drivers = await prisma.driver.findMany();
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getDriverById = async (req, res) => {
    try {
        const { id } = req.params;
        const driver = await prisma.driver.findUnique({
            where: { id },
            include: { trips: true }
        });
        if (!driver) return res.status(404).json({ error: 'Driver not found' });
        res.json(driver);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createDriver = async (req, res) => {
    try {
        const { name, licenseNumber, licenseExpiry, category } = req.body;

        const existing = await prisma.driver.findUnique({ where: { licenseNumber } });
        if (existing) {
            return res.status(400).json({ error: 'License number already exists' });
        }

        const driver = await prisma.driver.create({
            data: {
                name,
                licenseNumber,
                licenseExpiry: new Date(licenseExpiry),
                category
            }
        });
        res.status(201).json(driver);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateDriver = async (req, res) => {
    try {
        const { id } = req.params;
        const { licenseExpiry, ...rest } = req.body;

        const data = { ...rest };
        if (licenseExpiry) data.licenseExpiry = new Date(licenseExpiry);

        const driver = await prisma.driver.update({
            where: { id },
            data
        });
        res.json(driver);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    getAllDrivers,
    getDriverById,
    createDriver,
    updateDriver
};
