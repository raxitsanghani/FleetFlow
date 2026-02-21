const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');

const getDashboardStats = async (req, res) => {
    try {
        const activeFleet = await Vehicle.countDocuments({ status: 'ON_TRIP', deletedAt: null });
        const inShop = await Vehicle.countDocuments({ status: 'IN_SHOP', deletedAt: null });
        const totalVehicles = await Vehicle.countDocuments({ deletedAt: null });
        const utilization = totalVehicles > 0 ? (activeFleet / totalVehicles) * 100 : 0;

        const pendingTrips = await Trip.countDocuments({ status: 'DRAFT' });

        res.json({
            activeFleet,
            inShop,
            utilization: utilization.toFixed(2),
            pendingTrips,
            totalVehicles
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getVehicleAnalytics = async (req, res) => {
    try {
        // In Mongoose, we need to populate or do manual joins
        // For simplicity and since there's no schema-level virtual defined yet for trips etc,
        // we'll fetch everything and calculate. 
        // A better way would be using aggregate or virtuals.

        const vehicles = await Vehicle.find({ deletedAt: null }).lean();

        const analytics = await Promise.all(vehicles.map(async (v) => {
            // Manual fetch since we don't have virtuals/populate set up for reverse refs yet
            const FuelLog = require('../models/FuelLog');
            const Maintenance = require('../models/Maintenance');
            const Trip = require('../models/Trip');

            const [trips, maintenances, fuelLogs] = await Promise.all([
                Trip.find({ vehicleId: v._id }),
                Maintenance.find({ vehicleId: v._id }),
                FuelLog.find({ vehicleId: v._id })
            ]);

            const totalFuelCost = fuelLogs.reduce((sum, log) => sum + log.cost, 0);
            const totalMaintenanceCost = maintenances.reduce((sum, log) => sum + log.cost, 0);
            const totalRevenue = trips.reduce((sum, trip) => sum + (trip.revenue || 0), 0);

            const totalOperationalCost = totalFuelCost + totalMaintenanceCost;
            const roi = v.acquisitionCost > 0
                ? ((totalRevenue - totalOperationalCost) / v.acquisitionCost) * 100
                : 0;

            const totalKms = trips.reduce((sum, trip) => {
                if (trip.endOdometer && trip.startOdometer) {
                    return sum + (trip.endOdometer - trip.startOdometer);
                }
                return sum;
            }, 0);

            const totalLiters = fuelLogs.reduce((sum, log) => sum + log.liters, 0);
            const fuelEfficiency = totalLiters > 0 ? totalKms / totalLiters : 0;

            return {
                id: v._id,
                name: v.name,
                licensePlate: v.licensePlate,
                roi: roi.toFixed(2),
                fuelEfficiency: fuelEfficiency.toFixed(2),
                totalOperationalCost,
                totalRevenue,
                costPerKm: totalKms > 0 ? (totalOperationalCost / totalKms).toFixed(2) : 0
            };
        }));

        res.json(analytics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getDashboardStats, getVehicleAnalytics };
