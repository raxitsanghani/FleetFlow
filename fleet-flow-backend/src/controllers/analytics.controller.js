const prisma = require('../config/db');

const getDashboardStats = async (req, res) => {
    try {
        const activeFleet = await prisma.vehicle.count({ where: { status: 'ON_TRIP', deletedAt: null } });
        const inShop = await prisma.vehicle.count({ where: { status: 'IN_SHOP', deletedAt: null } });
        const totalVehicles = await prisma.vehicle.count({ where: { deletedAt: null } });
        const utilization = totalVehicles > 0 ? (activeFleet / totalVehicles) * 100 : 0;

        const pendingTrips = await prisma.trip.count({ where: { status: 'DRAFT' } });

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
        const vehicles = await prisma.vehicle.findMany({
            where: { deletedAt: null },
            include: {
                trips: true,
                maintenances: true,
                fuelLogs: true
            }
        });

        const analytics = vehicles.map(v => {
            const totalFuelCost = v.fuelLogs.reduce((sum, log) => sum + log.cost, 0);
            const totalMaintenanceCost = v.maintenances.reduce((sum, log) => sum + log.cost, 0);
            const totalRevenue = v.trips.reduce((sum, trip) => sum + (trip.revenue || 0), 0);

            const totalOperationalCost = totalFuelCost + totalMaintenanceCost;
            const roi = v.acquisitionCost > 0
                ? ((totalRevenue - totalOperationalCost) / v.acquisitionCost) * 100
                : 0;

            const totalKms = v.trips.reduce((sum, trip) => {
                if (trip.endOdometer && trip.startOdometer) {
                    return sum + (trip.endOdometer - trip.startOdometer);
                }
                return sum;
            }, 0);

            const totalLiters = v.fuelLogs.reduce((sum, log) => sum + log.liters, 0);
            const fuelEfficiency = totalLiters > 0 ? totalKms / totalLiters : 0;

            return {
                id: v.id,
                name: v.name,
                licensePlate: v.licensePlate,
                roi: roi.toFixed(2),
                fuelEfficiency: fuelEfficiency.toFixed(2),
                totalOperationalCost,
                totalRevenue,
                costPerKm: totalKms > 0 ? (totalOperationalCost / totalKms).toFixed(2) : 0
            };
        });

        res.json(analytics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getDashboardStats, getVehicleAnalytics };
