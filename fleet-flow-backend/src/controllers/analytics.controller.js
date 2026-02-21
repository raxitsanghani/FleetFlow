const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');
const Maintenance = require('../models/Maintenance');
const FuelLog = require('../models/FuelLog');

const getDashboardStats = async (req, res) => {
    try {
        const activeFleet = await Vehicle.countDocuments({ status: 'ON_TRIP', deletedAt: null });
        const inShop = await Vehicle.countDocuments({ status: 'IN_SHOP', deletedAt: null });
        const totalVehicles = await Vehicle.countDocuments({ deletedAt: null });
        const utilization = totalVehicles > 0 ? (activeFleet / totalVehicles) * 100 : 0;

        const pendingTripsCount = await Trip.countDocuments({ status: 'DRAFT' });

        // Financial Metrics - Current Month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const [monthlyTrips, monthlyMnt, monthlyFuel] = await Promise.all([
            Trip.find({ status: 'COMPLETED', updatedAt: { $gte: startOfMonth } }),
            Maintenance.find({ date: { $gte: startOfMonth } }),
            FuelLog.find({ date: { $gte: startOfMonth } })
        ]);

        const monthlyRevenue = monthlyTrips.reduce((s, t) => s + (t.revenue || 0), 0);
        const monthlyExpenses = monthlyMnt.reduce((s, m) => s + (m.cost || 0), 0) +
            monthlyFuel.reduce((s, f) => s + (f.cost || 0), 0);

        // Compiled Activity Feed (Latest 8 actions)
        const [recentTrips, recentMnt, recentFuel] = await Promise.all([
            Trip.find().sort({ createdAt: -1 }).limit(5).populate('vehicleId', 'name licensePlate'),
            Maintenance.find().sort({ createdAt: -1 }).limit(3).populate('vehicleId', 'name'),
            FuelLog.find().sort({ createdAt: -1 }).limit(3).populate('vehicleId', 'name')
        ]);

        const activities = [
            ...recentTrips.map(t => ({
                id: t._id,
                type: 'TRIP',
                title: `Trip ${t.status}`,
                description: `${t.vehicleId?.name || 'Asset'} - ${t.origin || 'N/A'} to ${t.destination || 'N/A'}`,
                date: t.updatedAt,
                amount: t.status === 'COMPLETED' ? `+$${t.revenue?.toLocaleString()}` : null
            })),
            ...recentMnt.map(m => ({
                id: m._id,
                type: 'MAINTENANCE',
                title: 'Service Logged',
                description: `${m.vehicleId?.name || 'Asset'} - ${m.description}`,
                date: m.date,
                amount: `-$${m.cost?.toLocaleString()}`
            })),
            ...recentFuel.map(f => ({
                id: f._id,
                type: 'FUEL',
                title: 'Fuel Refill',
                description: `${f.vehicleId?.name || 'Asset'} - ${f.liters}L refilled`,
                date: f.date,
                amount: `-$${f.cost?.toLocaleString()}`
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

        res.json({
            activeFleet,
            inShop,
            utilization: utilization.toFixed(1),
            pendingTrips: pendingTripsCount,
            totalVehicles,
            monthlyRevenue,
            monthlyExpenses,
            activities
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getVehicleAnalytics = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ deletedAt: null }).lean();

        const analytics = await Promise.all(vehicles.map(async (v) => {
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
                roi: roi.toFixed(1),
                fuelEfficiency: fuelEfficiency.toFixed(1),
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
