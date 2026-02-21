import { useEffect, useState, useRef } from 'react';
import { Plus, Search, MoreVertical, Filter, Pencil, Trash2, RefreshCw, Star, UserX, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';
import DriverModal from '../components/DriverModal';
import { toast } from 'react-toastify';

const statusColors = {
    ON_DUTY: 'bg-green-100 text-green-700',
    OFF_DUTY: 'bg-slate-100 text-slate-700',
    SUSPENDED: 'bg-red-100 text-red-700',
    ON_TRIP: 'bg-blue-100 text-blue-700',
};

const ALL_STATUSES = ['ON_DUTY', 'OFF_DUTY', 'SUSPENDED'];

// Fixed-position dropdown — escapes overflow:hidden table
const ActionMenu = ({ driver, onEdit, onDelete, onStatusChange }) => {
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const btnRef = useRef(null);
    const menuRef = useRef(null);

    const handleOpen = () => {
        const rect = btnRef.current.getBoundingClientRect();
        setCoords({ top: rect.bottom + 4, left: rect.right - 208 });
        setOpen(o => !o);
    };

    useEffect(() => {
        const handler = (e) => {
            if (
                menuRef.current && !menuRef.current.contains(e.target) &&
                btnRef.current && !btnRef.current.contains(e.target)
            ) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // drivers on a trip can't be manually status-changed
    const changeableStatuses = driver.status === 'ON_TRIP'
        ? []
        : ALL_STATUSES.filter(s => s !== driver.status);

    return (
        <>
            <button
                ref={btnRef}
                onClick={handleOpen}
                className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
                <MoreVertical size={18} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        ref={menuRef}
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.12 }}
                        style={{ position: 'fixed', top: coords.top, left: coords.left, zIndex: 9999 }}
                        className="w-52 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden"
                    >
                        {/* Edit */}
                        <button
                            onClick={() => { onEdit(driver); setOpen(false); }}
                            className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <Pencil size={15} className="text-primary-500" />
                            <span>Edit Details</span>
                        </button>

                        {/* Status changes */}
                        {changeableStatuses.length > 0 && (
                            <>
                                <div className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100 bg-slate-50">
                                    Change Status
                                </div>
                                {changeableStatuses.map(s => {
                                    const Icon = s === 'SUSPENDED' ? UserX : UserCheck;
                                    const color = s === 'SUSPENDED' ? 'text-red-500' : s === 'ON_DUTY' ? 'text-green-600' : 'text-slate-400';
                                    return (
                                        <button
                                            key={s}
                                            onClick={() => { onStatusChange(driver._id, s); setOpen(false); }}
                                            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                        >
                                            <Icon size={13} className={color} />
                                            <span>{s.replace('_', ' ')}</span>
                                        </button>
                                    );
                                })}
                            </>
                        )}

                        {driver.status === 'ON_TRIP' && (
                            <p className="px-4 py-2 text-[10px] text-slate-400 italic border-t border-slate-100">
                                Status locked during trip
                            </p>
                        )}

                        {/* Delete */}
                        <div className="border-t border-slate-100">
                            <button
                                onClick={() => { onDelete(driver); setOpen(false); }}
                                className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <Trash2 size={15} />
                                <span>Remove Driver</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// Confirm delete modal
const DeleteConfirmModal = ({ driver, onConfirm, onCancel }) => {
    if (!driver) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4"
            >
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <Trash2 size={24} className="text-red-600" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Remove Driver?</h3>
                    <p className="text-sm text-slate-500 mt-1">
                        <strong>{driver.name}</strong> ({driver.licenseNumber}) will be permanently removed
                        from the workforce. This action cannot be undone.
                    </p>
                </div>
                <div className="flex space-x-3 pt-2">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors font-semibold"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                    >
                        Yes, Remove
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const Drivers = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDriver, setEditingDriver] = useState(null);
    const [deletingDriver, setDeletingDriver] = useState(null);

    useEffect(() => { fetchDrivers(); }, []);

    const fetchDrivers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/drivers');
            setDrivers(data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch drivers');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (driver) => {
        setEditingDriver(driver);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingDriver(null);
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await api.put(`/drivers/${id}`, { status: newStatus });
            toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
            fetchDrivers();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update status');
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deletingDriver) return;
        try {
            await api.delete(`/drivers/${deletingDriver._id}`);
            toast.success(`${deletingDriver.name} removed from workforce`);
            setDeletingDriver(null);
            fetchDrivers();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to remove driver');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Driver Workforce</h1>
                    <p className="text-slate-500">Manage your qualified personnel and assignments</p>
                </div>
                <button
                    onClick={() => { setEditingDriver(null); setIsModalOpen(true); }}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors"
                >
                    <Plus size={20} />
                    <span>Add Driver</span>
                </button>
            </div>

            <DriverModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onRefresh={fetchDrivers}
                driver={editingDriver}
            />

            <DeleteConfirmModal
                driver={deletingDriver}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeletingDriver(null)}
            />

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or license..."
                            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <button className="flex items-center space-x-2 text-slate-500 text-sm hover:text-slate-900 transition-colors">
                        <Filter size={18} />
                        <span>Filters</span>
                    </button>
                </div>

                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Driver Info</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">License</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Category</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Safety Score</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500 italic">Fetching workforce data...</td></tr>
                        ) : drivers.length === 0 ? (
                            <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500 italic">No operators registered in your system</td></tr>
                        ) : drivers.map((d) => (
                            <tr key={d._id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200 uppercase text-sm">
                                            {d.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">{d.name}</p>
                                            <p className="text-xs text-slate-500 capitalize">{d.category?.toLowerCase()}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm font-medium text-slate-700">{d.licenseNumber}</p>
                                    <p className={`text-[10px] font-bold ${new Date(d.licenseExpiry) < new Date() ? 'text-red-500' : 'text-slate-400'}`}>
                                        Exp: {new Date(d.licenseExpiry).toLocaleDateString()}
                                    </p>
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    <span className="text-xs">{d.category}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-2">
                                        <Star size={14} className="text-yellow-500" fill="currentColor" />
                                        <span className="text-sm font-bold text-slate-900">{d.safetyScore ?? 100}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${statusColors[d.status] || statusColors.OFF_DUTY}`}>
                                        {d.status?.replace('_', ' ') || 'OFF DUTY'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <ActionMenu
                                        driver={d}
                                        onEdit={handleEdit}
                                        onDelete={setDeletingDriver}
                                        onStatusChange={handleStatusChange}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Drivers;
