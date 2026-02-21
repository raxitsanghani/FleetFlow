const mongoose = require('mongoose');

const fuelLogSchema = new mongoose.Schema({
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', default: null },
    liters: { type: Number, required: true },
    cost: { type: Number, required: true },
    date: { type: Date, default: Date.now }
}, { timestamps: true, collection: 'FuelLog' });

module.exports = mongoose.model('FuelLog', fuelLogSchema);
