const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    startOdometer: { type: Number, required: true },
    endOdometer: { type: Number },
    revenue: { type: Number, default: 0.0 },
    cargoWeight: { type: Number, required: true },
    status: {
        type: String,
        enum: ['DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED'],
        default: 'DRAFT'
    }
}, { timestamps: true, collection: 'Trip' });

module.exports = mongoose.model('Trip', tripSchema);
