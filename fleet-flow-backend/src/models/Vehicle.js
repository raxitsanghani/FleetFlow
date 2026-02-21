const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    licensePlate: { type: String, required: true, unique: true },
    type: {
        type: String,
        enum: ['TRUCK', 'VAN', 'BIKE'],
        required: true
    },
    maxCapacity: { type: Number, required: true },
    odometer: { type: Number, required: true },
    acquisitionCost: { type: Number, required: true },
    status: {
        type: String,
        enum: ['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED'],
        default: 'AVAILABLE'
    },
    deletedAt: { type: Date, default: null }
}, { timestamps: true, collection: 'Vehicle' });

module.exports = mongoose.model('Vehicle', vehicleSchema);
