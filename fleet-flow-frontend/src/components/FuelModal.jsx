import { useState, useEffect } from 'react';
import { X, Truck, Fuel, DollarSign, Calendar, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/api';
import { toast } from 'react-toastify';

const emptyForm = {
    vehicleId: '',
    tripId: '',
    liters: '',
    cost: '',
    date: new Date().toISOString().split('T')[0]
};

const FuelModal = ({ isOpen, onClose, onRefresh, fuelEntry = null }) => {
    const [vehicles, setVehicles] = useState([]);
    const [trips, setTrips] = useState([]);
    const [formData, setFormData] = useState(emptyForm);
    const [loading, setLoading] = useState(false);
    const isEdit = !!fuelEntry;

    useEffect(() => {
        if (isOpen) {
            fetchResources();
            if (fuelEntry) {
                setFormData({
                    vehicleId: fuelEntry.vehicle?._id || fuelEntry.vehicleId?._id || fuelEntry.vehicleId || '',
                    tripId: fuelEntry.trip?._id || fuelEntry.tripId?._id || fuelEntry.tripId || '',
                    liters: fuelEntry.liters || '',
                    cost: fuelEntry.cost || '',
                    date: fuelEntry.date ? new Date(fuelEntry.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
                });
            } else {
                setFormData(emptyForm);
            }
        }
    }, [isOpen, fuelEntry]);

    const fetchResources = async () => {
        try {
            const [vRes, tRes] = await Promise.all([
                api.get('/vehicles'),
                api.get('/trips')
            ]);
            setVehicles(vRes.data.filter(v => v.status !== 'RETIRED' || (isEdit && v._id === formData.vehicleId)));
            // Only show recent dispatched/completed trips
            setTrips(tRes.data.filter(t => ['DISPATCHED', 'COMPLETED'].includes(t.status) || (isEdit && t._id === formData.tripId)));
        } catch (err) {
            toast.error('Failed to load resources');
        }
    };

    // Filter trips by selected vehicle
    const filteredTrips = formData.vehicleId
        ? trips.filter(t => (t.vehicleId?._id || t.vehicleId) === formData.vehicleId)
        : trips;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...formData };
            if (!payload.tripId) payload.tripId = null;

            if (isEdit) {
                await api.put(`/fuel/${fuelEntry._id}`, payload);
                toast.success('Fuel log updated!');
            } else {
                await api.post('/fuel', payload);
                toast.success('Fuel log recorded!');
            }
            onRefresh();
            onClose();
            setFormData(emptyForm);
        } catch (err) {
            toast.error(err.response?.data?.error || `Failed to ${isEdit ? 'update' : 'log'} fuel`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Fuel Entry' : 'Log Fuel Entry'}</h2>
                        <p className="text-sm text-slate-500">{isEdit ? 'Update existing fuel record' : 'Record a refuel and optionally link it to a trip'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700">Vehicle</label>
                        <div className="relative">
                            <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <select
                                required
                                disabled={isEdit}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 bg-white font-medium text-slate-900 disabled:bg-slate-100"
                                value={formData.vehicleId}
                                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value, tripId: '' })}
                            >
                                <option value="">Select a vehicle</option>
                                {vehicles.map(v => (
                                    <option key={v._id} value={v._id}>{v.name} ({v.licensePlate})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700">
                            Link to Trip <span className="text-slate-400 font-normal">(optional)</span>
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <select
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 bg-white font-medium text-slate-900"
                                value={formData.tripId}
                                onChange={(e) => setFormData({ ...formData, tripId: e.target.value })}
                                disabled={!formData.vehicleId}
                            >
                                <option value="">No trip linked</option>
                                {filteredTrips.map(t => (
                                    <option key={t._id} value={t._id}>
                                        {t.vehicle?.name || 'Vehicle'} — {t.status} ({new Date(t.createdAt).toLocaleDateString()})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Liters</label>
                            <div className="relative">
                                <Fuel className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    required type="number" step="0.01" placeholder="e.g. 45"
                                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 font-medium text-slate-900"
                                    value={formData.liters}
                                    onChange={(e) => setFormData({ ...formData, liters: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Cost ($)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    required type="number" step="0.01" placeholder="e.g. 85"
                                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 font-medium text-slate-900"
                                    value={formData.cost}
                                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    required type="date"
                                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 font-medium text-slate-900 bg-white"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {formData.liters && formData.cost && (
                        <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600 flex justify-between">
                            <span>Price per liter</span>
                            <span className="font-bold text-slate-900">
                                ${(Number(formData.cost) / Number(formData.liters)).toFixed(2)}/L
                            </span>
                        </div>
                    )}

                    <div className="pt-2 flex space-x-3">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors font-semibold">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50">
                            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Save Entry'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default FuelModal;
