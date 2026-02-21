const Driver = require('../models/Driver');

const getAllDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find();
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getDriverById = async (req, res) => {
    try {
        const { id } = req.params;
        const driver = await Driver.findById(id);
        if (!driver) return res.status(404).json({ error: 'Driver not found' });
        res.json(driver);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createDriver = async (req, res) => {
    try {
        const { name, licenseNumber, licenseExpiry, category } = req.body;

        const existing = await Driver.findOne({ licenseNumber });
        if (existing) {
            return res.status(400).json({ error: 'License number already exists' });
        }

        const driver = await Driver.create({
            name,
            licenseNumber,
            licenseExpiry: new Date(licenseExpiry),
            category
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

        const driver = await Driver.findByIdAndUpdate(id, data, { new: true });
        res.json(driver);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteDriver = async (req, res) => {
    try {
        const { id } = req.params;
        const driver = await Driver.findById(id);
        if (!driver) return res.status(404).json({ error: 'Driver not found' });
        if (driver.status === 'ON_TRIP') {
            return res.status(400).json({ error: 'Cannot remove a driver who is currently on a trip' });
        }
        await Driver.findByIdAndDelete(id);
        res.json({ message: 'Driver removed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllDrivers,
    getDriverById,
    createDriver,
    updateDriver,
    deleteDriver
};
