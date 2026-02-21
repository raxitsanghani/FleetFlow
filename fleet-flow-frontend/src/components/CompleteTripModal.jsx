import { useState } from 'react';
import { X, Gauge, DollarSign, Fuel, Droplets, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/api';
import { toast } from 'react-toastify';

const CompleteTripModal = ({ trip, isOpen, onClose, onRefresh }) => {
    const [formData, setFormData] = useState({
        endOdometer: '',
        revenue: '',
        // Fuel — optional
        fuelLiters: '',
        fuelCost: '',
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen || !trip) return null;

    const kmDriven = formData.endOdometer && trip.startOdometer
        ? Math.max(0, Number(formData.endOdometer) - trip.startOdometer)
        : null;

    const pricePerLiter = formData.fuelLiters && formData.fuelCost
        ? (Number(formData.fuelCost) / Number(formData.fuelLiters)).toFixed(2)
        : null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (Number(formData.endOdometer) < trip.startOdometer) {
            toast.error('End odometer must be greater than start odometer');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                endOdometer: Number(formData.endOdometer),
                revenue: Number(formData.revenue),
            };
            if (formData.fuelLiters && formData.fuelCost) {
                payload.fuelLiters = Number(formData.fuelLiters);
                payload.fuelCost = Number(formData.fuelCost);
            }

            await api.put(`/trips/${trip._id}/complete`, payload);
            toast.success(
                formData.fuelLiters
                    ? 'Trip completed & fuel entry logged!'
                    : 'Trip marked as completed!'
            );
            onRefresh();
            onClose();
            setFormData({ endOdometer: '', revenue: '', fuelLiters: '', fuelCost: '' });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to complete trip');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Complete Trip</h2>
                        <p className="text-sm text-slate-500">
                            {trip.vehicle?.name} · Driver: {trip.driver?.name}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Trip start odometer reference */}
                    <div className="bg-blue-50 rounded-xl px-4 py-3 flex justify-between items-center text-sm">
                        <span className="text-blue-700 font-medium">Start Odometer</span>
                        <span className="font-bold text-blue-900">{trip.startOdometer?.toLocaleString()} km</span>
                    </div>

                    {/* Trip completion fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">End Odometer (km)</label>
                            <div className="relative">
                                <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    required
                                    type="number"
                                    placeholder={`> ${trip.startOdometer}`}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 font-medium text-slate-900"
                                    value={formData.endOdometer}
                                    onChange={(e) => setFormData({ ...formData, endOdometer: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Trip Revenue ($)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 font-medium text-slate-900"
                                    value={formData.revenue}
                                    onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Distance calculated */}
                    {kmDriven !== null && (
                        <div className="bg-green-50 rounded-xl px-4 py-3 flex justify-between items-center text-sm">
                            <span className="text-green-700 font-medium">Distance Covered</span>
                            <span className="font-bold text-green-900">{kmDriven.toLocaleString()} km</span>
                        </div>
                    )}

                    {/* Divider */}
                    <div className="flex items-center space-x-3">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center space-x-1.5">
                            <Fuel size={14} />
                            <span>Fuel Fill-up (Optional)</span>
                        </span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Liters Filled</label>
                            <div className="relative">
                                <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="e.g. 45"
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 font-medium text-slate-900"
                                    value={formData.fuelLiters}
                                    onChange={(e) => setFormData({ ...formData, fuelLiters: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Fuel Cost ($)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="e.g. 85.50"
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 font-medium text-slate-900"
                                    value={formData.fuelCost}
                                    onChange={(e) => setFormData({ ...formData, fuelCost: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Price per liter hint */}
                    {pricePerLiter && (
                        <div className="bg-orange-50 rounded-xl px-4 py-3 flex justify-between items-center text-sm">
                            <span className="text-orange-700 font-medium">Price per Liter</span>
                            <span className="font-bold text-orange-900">${pricePerLiter} / L</span>
                        </div>
                    )}

                    {/* Fuel entry notice */}
                    {formData.fuelLiters && formData.fuelCost && (
                        <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                            ℹ️ This fuel entry will automatically appear in <strong>Fuel Logs</strong>, linked to this trip.
                        </p>
                    )}

                    {/* Actions */}
                    <div className="pt-2 flex space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                            <CheckCircle2 size={18} />
                            <span>{loading ? 'Saving...' : 'Complete Trip'}</span>
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default CompleteTripModal;
