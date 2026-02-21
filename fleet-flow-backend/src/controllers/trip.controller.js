const prisma = require('../config/db');

const createTrip = async (req, res) => {
    try {
        const { vehicleId, driverId, cargoWeight, startOdometer } = req.body;

        // 1. Check Vehicle
        const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
        if (!vehicle || vehicle.status !== 'AVAILABLE' || vehicle.deletedAt) {
            return res.status(400).json({ error: 'Vehicle is not available' });
        }
        if (cargoWeight > vehicle.maxCapacity) {
            return res.status(400).json({ error: 'Cargo weight exceeds vehicle capacity' });
        }

        // 2. Check Driver
        const driver = await prisma.driver.findUnique({ where: { id: driverId } });
        if (!driver || driver.status !== 'ON_DUTY') {
            return res.status(400).json({ error: 'Driver is not on duty' });
        }
        if (new Date(driver.licenseExpiry) < new Date()) {
            return res.status(400).json({ error: 'Driver license has expired' });
        }

        // 3. Create Trip in DRAFT (or DISPATCHED based on logic)
        const trip = await prisma.trip.create({
            data: {
                vehicleId,
                driverId,
                cargoWeight,
                startOdometer: startOdometer || vehicle.odometer,
                status: 'DRAFT'
            }
        });

        res.status(201).json(trip);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const dispatchTrip = async (req, res) => {
    try {
        const { id } = req.params;

        const trip = await prisma.trip.findUnique({ where: { id } });
        if (!trip) return res.status(404).json({ error: 'Trip not found' });

        // Transaction to update trip, vehicle, and driver
        const result = await prisma.$transaction([
            prisma.trip.update({
                where: { id },
                data: { status: 'DISPATCHED' }
            }),
            prisma.vehicle.update({
                where: { id: trip.vehicleId },
                data: { status: 'ON_TRIP' }
            }),
            prisma.driver.update({
                where: { id: trip.driverId },
                data: { status: 'ON_TRIP' }
            })
        ]);

        res.json({ message: 'Trip dispatched', result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const completeTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const { endOdometer, revenue } = req.body;

        const trip = await prisma.trip.findUnique({ where: { id } });
        if (!trip) return res.status(404).json({ error: 'Trip not found' });

        if (endOdometer < trip.startOdometer) {
            return res.status(400).json({ error: 'End odometer cannot be less than start odometer' });
        }

        const result = await prisma.$transaction([
            prisma.trip.update({
                where: { id },
                data: {
                    status: 'COMPLETED',
                    endOdometer,
                    revenue
                }
            }),
            prisma.vehicle.update({
                where: { id: trip.vehicleId },
                data: { status: 'AVAILABLE', odometer: endOdometer }
            }),
            prisma.driver.update({
                where: { id: trip.driverId },
                data: { status: 'ON_DUTY' }
            })
        ]);

        res.json({ message: 'Trip completed', result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAllTrips = async (req, res) => {
    try {
        const trips = await prisma.trip.findMany({
            include: {
                vehicle: true,
                driver: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(trips);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createTrip,
    dispatchTrip,
    completeTrip,
    getAllTrips
};
