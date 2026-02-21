import { useState, useEffect } from 'react';
import { X, Truck, User, Weight, Gauge, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/api';
import { toast } from 'react-toastify';

const TripModal = ({ isOpen, onClose, onRefresh }) => {
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [formData, setFormData] = useState({
        vehicleId: '',
        driverId: '',
        cargoWeight: '',
        startOdometer: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchResources();
        }
    }, [isOpen]);

    const fetchResources = async () => {
        try {
            const [vRes, dRes] = await Promise.all([
                api.get('/vehicles'),
                api.get('/drivers')
            ]);
            // Only show available vehicles and on-duty drivers
            setVehicles(vRes.data.filter(v => v.status === 'AVAILABLE'));
            setDrivers(dRes.data.filter(d => d.status === 'ON_DUTY'));
        } catch (err) {
            toast.error('Failed to load available resources');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/trips', formData);
            toast.success('Trip created successfully!');
            onRefresh();
            onClose();
            setFormData({
                vehicleId: '',
                driverId: '',
                cargoWeight: '',
                startOdometer: ''
            });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to create trip');
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
                        <h2 className="text-xl font-bold text-slate-900">Plan New Trip</h2>
                        <p className="text-sm text-slate-500">Assign vehicle and driver for a new assignment</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Select Vehicle</label>
                            <div className="relative">
                                <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <select
                                    required
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all bg-white font-medium text-slate-900"
                                    value={formData.vehicleId}
                                    onChange={(e) => {
                                        const v = vehicles.find(v => v._id === e.target.value);
                                        setFormData({ ...formData, vehicleId: e.target.value, startOdometer: v?.odometer || '' });
                                    }}
                                >
                                    <option value="">Choose an available vehicle</option>
                                    {vehicles.map(v => (
                                        <option key={v._id} value={v._id}>{v.name} ({v.licensePlate})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Select Driver</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <select
                                    required
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all bg-white font-medium text-slate-900"
                                    value={formData.driverId}
                                    onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                                >
                                    <option value="">Choose an on-duty driver</option>
                                    {drivers.map(d => (
                                        <option key={d._id} value={d._id}>{d.name} ({d.category})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Cargo Weight (kg)</label>
                            <div className="relative">
                                <Weight className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    required
                                    type="number"
                                    placeholder="e.g. 1200"
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-slate-900"
                                    value={formData.cargoWeight}
                                    onChange={(e) => setFormData({ ...formData, cargoWeight: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Start Odometer</label>
                            <div className="relative">
                                <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    required
                                    type="number"
                                    placeholder="Auto-filled"
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-slate-900 bg-slate-50"
                                    value={formData.startOdometer}
                                    onChange={(e) => setFormData({ ...formData, startOdometer: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.vehicleId || !formData.driverId}
                            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Create Draft'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default TripModal;
