const Vehicle = require('../models/Vehicle');
const Maintenance = require('../models/Maintenance');
const { generateUID } = require('../utils/idGenerator');

const getAllVehicles = async (req, res) => {
    try {
        // Auto-lock vehicles that have maintenance scheduled for today
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const tomorrowStart = new Date(todayStart);
        tomorrowStart.setDate(tomorrowStart.getDate() + 1);

        // Find all maintenance records dated today
        const todayMaintenances = await Maintenance.find({
            date: { $gte: todayStart, $lt: tomorrowStart }
        });

        // Flip those vehicles to IN_SHOP if they're still AVAILABLE
        if (todayMaintenances.length > 0) {
            const vehicleIds = todayMaintenances.map(m => m.vehicleId);
            await Vehicle.updateMany(
                { _id: { $in: vehicleIds }, status: 'AVAILABLE' },
                { status: 'IN_SHOP' }
            );
        }

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
            uid: generateUID('VEH'),
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

        const vehicle = await Vehicle.findById(id);
        if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

        // Enforce Status Rules
        if (data.status && data.status !== vehicle.status) {
            const allowedManual = {
                'AVAILABLE': ['RETIRED'],
                'RETIRED': ['AVAILABLE']
            };
            const allowed = allowedManual[vehicle.status] || [];
            if (!allowed.includes(data.status)) {
                return res.status(400).json({
                    error: `Cannot manually set status to ${data.status}. This status is managed by Trip/Maintenance modules.`
                });
            }
        }

        const updated = await Vehicle.findByIdAndUpdate(id, data, { new: true });
        res.json(updated);
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
