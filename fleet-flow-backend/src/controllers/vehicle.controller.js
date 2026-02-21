const Vehicle = require('../models/Vehicle');

const getAllVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ deletedAt: null });
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getVehicleById = async (req, res) => {
    try {
        const { id } = req.params;
        const vehicle = await Vehicle.findOne({ _id: id, deletedAt: null });
        if (!vehicle) {
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

        const existing = await Vehicle.findOne({ licensePlate });
        if (existing) {
            return res.status(400).json({ error: 'License plate already exists' });
        }

        const vehicle = await Vehicle.create({
            name, licensePlate, type, maxCapacity, odometer, acquisitionCost
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
        const vehicle = await Vehicle.findByIdAndUpdate(id, data, { new: true });
        res.json(vehicle);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        await Vehicle.findByIdAndUpdate(id, { deletedAt: new Date(), status: 'RETIRED' });
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
