const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    // Clear existing data
    await prisma.fuelLog.deleteMany();
    await prisma.maintenance.deleteMany();
    await prisma.trip.deleteMany();
    await prisma.driver.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();

    // Create Users
    const hashedPassword = await bcrypt.hash('password123', 10);

    await prisma.user.createMany({
        data: [
            { email: 'manager@fleet.com', password: hashedPassword, name: 'John Manager', role: 'FLEET_MANAGER' },
            { email: 'dispatcher@fleet.com', password: hashedPassword, name: 'Alice Dispatcher', role: 'DISPATCHER' },
            { email: 'safety@fleet.com', password: hashedPassword, name: 'Bob Safety', role: 'SAFETY_OFFICER' },
            { email: 'finance@fleet.com', password: hashedPassword, name: 'Charlie Finance', role: 'FINANCIAL_ANALYST' },
        ]
    });

    // Create Vehicles
    const v1 = await prisma.vehicle.create({
        data: {
            name: 'Freightliner M2',
            licensePlate: 'ABC-1234',
            type: 'TRUCK',
            maxCapacity: 5000,
            odometer: 15000,
            acquisitionCost: 45000,
            status: 'AVAILABLE'
        }
    });

    const v2 = await prisma.vehicle.create({
        data: {
            name: 'Ford Transit',
            licensePlate: 'XYZ-5678',
            type: 'VAN',
            maxCapacity: 1500,
            odometer: 8000,
            acquisitionCost: 28000,
            status: 'AVAILABLE'
        }
    });

    // Create Drivers
    const d1 = await prisma.driver.create({
        data: {
            name: 'Michael Driver',
            licenseNumber: 'DL-998877',
            licenseExpiry: new Date('2027-12-31'),
            category: 'Heavy Truck',
            status: 'ON_DUTY',
            safetyScore: 95.5
        }
    });

    console.log('Seed data created successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
