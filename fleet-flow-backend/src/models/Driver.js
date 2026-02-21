const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    name: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    licenseExpiry: { type: Date, required: true },
    category: { type: String, required: true },
    status: {
        type: String,
        enum: ['ON_DUTY', 'OFF_DUTY', 'SUSPENDED', 'ON_TRIP'],
        default: 'OFF_DUTY'
    },
    safetyScore: { type: Number, default: 100.0 }
}, { timestamps: true, collection: 'Driver' });

module.exports = mongoose.model('Driver', driverSchema);
