const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
    uid: { type: String, unique: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    description: { type: String, required: true },
    cost: { type: Number, required: true },
    date: { type: Date, default: Date.now }
}, { timestamps: true, collection: 'Maintenance' });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
