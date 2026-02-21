import { useState, useEffect } from 'react';
import { X, Truck, FileText, DollarSign, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/api';
import { toast } from 'react-toastify';

const emptyForm = {
    vehicleId: '',
    description: '',
    cost: '',
    date: new Date().toISOString().split('T')[0]
};

const MaintenanceModal = ({ isOpen, onClose, onRefresh, maintenance = null }) => {
    const [vehicles, setVehicles] = useState([]);
    const [formData, setFormData] = useState(emptyForm);
    const [loading, setLoading] = useState(false);
    const isEdit = !!maintenance;

    // Restrict date picker: today → 1 year ahead (only for new records, edits might be past/future)
    const today = new Date().toISOString().split('T')[0];
    const maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];

    useEffect(() => {
        if (isOpen) {
            fetchVehicles();
            if (maintenance) {
                setFormData({
                    vehicleId: maintenance.vehicle?._id || maintenance.vehicleId?._id || maintenance.vehicleId || '',
                    description: maintenance.description || '',
                    cost: maintenance.cost || '',
                    date: maintenance.date ? new Date(maintenance.date).toISOString().split('T')[0] : today
                });
            } else {
                setFormData(emptyForm);
            }
        }
    }, [isOpen, maintenance]);

    const fetchVehicles = async () => {
        try {
            const { data } = await api.get('/vehicles');
            // If editing, include the current vehicle even if it's IN_SHOP
            setVehicles(data.filter(v =>
                (v.status !== 'IN_SHOP' && v.status !== 'RETIRED') ||
                (isEdit && (v._id === formData.vehicleId))
            ));
        } catch (err) {
            toast.error('Failed to load vehicles');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEdit) {
                await api.put(`/maintenances/${maintenance._id}`, formData);
                toast.success('Maintenance record updated!');
            } else {
                await api.post('/maintenances', formData);
                toast.success('Maintenance log created successfully!');
            }
            onRefresh();
            onClose();
            setFormData(emptyForm);
        } catch (err) {
            toast.error(err.response?.data?.error || `Failed to ${isEdit ? 'update' : 'log'} maintenance`);
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
                        <h2 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Maintenance' : 'Log Maintenance'}</h2>
                        <p className="text-sm text-slate-500">{isEdit ? 'Update previous service record' : 'Record a service entry for a vehicle'}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
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
                                disabled={isEdit} // Usually better not to change the vehicle on an existing record
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all bg-white font-medium text-slate-900 disabled:bg-slate-100"
                                value={formData.vehicleId}
                                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                            >
                                <option value="">Select a vehicle</option>
                                {vehicles.map(v => (
                                    <option key={v._id} value={v._id}>{v.name} ({v.licensePlate})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700">Service Description</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 text-slate-400" size={18} />
                            <textarea
                                required
                                placeholder="Describe the service/repair performed..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-slate-900 h-24 resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Cost (USD)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    required
                                    type="number"
                                    placeholder="0.00"
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-slate-900"
                                    value={formData.cost}
                                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Service Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    required
                                    type="date"
                                    min={today}
                                    max={maxDate}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-slate-900 bg-white"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Save Record'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default MaintenanceModal;
