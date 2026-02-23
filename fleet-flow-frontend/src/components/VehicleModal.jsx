import { useState, useEffect } from 'react';
import { X, Truck, Hash, Gauge, IndianRupee, Weight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/api';
import { toast } from 'react-toastify';

const emptyForm = {
    name: '',
    licensePlate: '',
    type: 'TRUCK',
    maxCapacity: '',
    odometer: '',
    acquisitionCost: ''
};

// Accepts optional `vehicle` prop — if provided, modal is in Edit mode
const VehicleModal = ({ isOpen, onClose, onRefresh, vehicle = null }) => {
    const [formData, setFormData] = useState(emptyForm);
    const [loading, setLoading] = useState(false);
    const isEdit = !!vehicle;

    useEffect(() => {
        if (vehicle) {
            setFormData({
                name: vehicle.name || '',
                licensePlate: vehicle.licensePlate || '',
                type: vehicle.type || 'TRUCK',
                maxCapacity: vehicle.maxCapacity || '',
                odometer: vehicle.odometer || '',
                acquisitionCost: vehicle.acquisitionCost || ''
            });
        } else {
            setFormData(emptyForm);
        }
    }, [vehicle, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                maxCapacity: parseFloat(formData.maxCapacity),
                odometer: parseFloat(formData.odometer),
                acquisitionCost: parseFloat(formData.acquisitionCost)
            };

            if (isEdit) {
                await api.put(`/vehicles/${vehicle._id}`, payload);
                toast.success('Vehicle updated successfully!');
            } else {
                await api.post('/vehicles', payload);
                toast.success('Vehicle added successfully!');
            }

            onRefresh();
            onClose();
            setFormData(emptyForm);
        } catch (err) {
            toast.error(err.response?.data?.error || `Failed to ${isEdit ? 'update' : 'add'} vehicle`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden my-auto"
            >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            {isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}
                        </h2>
                        <p className="text-sm text-slate-500">
                            {isEdit ? `Editing: ${vehicle.name}` : 'Register a new asset to the fleet'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600 outline-none"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2 space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Vehicle Name</label>
                            <div className="relative">
                                <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Heavy Duty Volvo v4"
                                    className="w-full pl-10 pr-4 py-2 text-gray-900 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all sm:text-sm"
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
                                    className="w-full pl-10 pr-4 py-2 text-gray-900 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all sm:text-sm"
                                    value={formData.licensePlate}
                                    onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Vehicle Type</label>
                            <select
                                className="w-full px-4 py-2 border text-gray-900 border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all bg-white sm:text-sm"
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
                                    className="w-full pl-10 pr-4 py-2 text-gray-900 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all sm:text-sm"
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
                                    className="w-full pl-10 pr-4 py-2 text-gray-900 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all sm:text-sm"
                                    value={formData.odometer}
                                    onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2 space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Acquisition Cost (₹)</label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    required
                                    type="number"
                                    placeholder="45000"
                                    className="w-full pl-10 pr-4 py-2 text-gray-900 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all sm:text-sm"
                                    value={formData.acquisitionCost}
                                    onChange={(e) => setFormData({ ...formData, acquisitionCost: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors font-semibold outline-none sm:text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50 outline-none sm:text-sm"
                        >
                            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Confirm Asset'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default VehicleModal;
