import { useState } from 'react';
import { X, Truck, Hash, Gauge, DollarSign, Weight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';
import { toast } from 'react-toastify';

const VehicleModal = ({ isOpen, onClose, onRefresh }) => {
    const [formData, setFormData] = useState({
        name: '',
        licensePlate: '',
        type: 'TRUCK',
        maxCapacity: '',
        odometer: '',
        acquisitionCost: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/vehicles', {
                ...formData,
                maxCapacity: parseFloat(formData.maxCapacity),
                odometer: parseFloat(formData.odometer),
                acquisitionCost: parseFloat(formData.acquisitionCost)
            });
            toast.success('Vehicle added successfully!');
            onRefresh();
            onClose();
            setFormData({
                name: '',
                licensePlate: '',
                type: 'TRUCK',
                maxCapacity: '',
                odometer: '',
                acquisitionCost: ''
            });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to add vehicle');
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
                        <h2 className="text-xl font-bold text-slate-900">Add New Vehicle</h2>
                        <p className="text-sm text-slate-500">Register a new asset to the fleet</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Vehicle Name</label>
                            <div className="relative">
                                <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Heavy Duty Volvo v4"
                                    className="w-full pl-10 pr-4 py-2 text-gray-900 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">License Plate</label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. ABC-1234"
                                    className="w-full pl-10 pr-4 py-2 text-gray-900 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all caps"
                                    value={formData.licensePlate}
                                    onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Vehicle Type</label>
                            <select
                                className="w-full px-4 py-2 border text-gray-900 border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all bg-white"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="TRUCK">Truck</option>
                                <option value="VAN">Van</option>
                                <option value="BIKE">Bike</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Max Capacity (kg)</label>
                            <div className="relative">
                                <Weight className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    required
                                    type="number"
                                    placeholder="5000"
                                    className="w-full pl-10 pr-4 py-2 text-gray-900 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                    value={formData.maxCapacity}
                                    onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Current Odometer (km)</label>
                            <div className="relative">
                                <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    required
                                    type="number"
                                    placeholder="15000"
                                    className="w-full pl-10 pr-4 py-2 text-gray-900 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                    value={formData.odometer}
                                    onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="col-span-2 space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Acquisition Cost ($)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    required
                                    type="number"
                                    placeholder="45000"
                                    className="w-full pl-10 pr-4 py-2 text-gray-900 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                    value={formData.acquisitionCost}
                                    onChange={(e) => setFormData({ ...formData, acquisitionCost: e.target.value })}
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
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Confirm Asset'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default VehicleModal;
