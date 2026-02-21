import { useEffect, useState, useRef } from 'react';
import { Plus, Search, MoreVertical, Filter, Pencil, Trash2, RefreshCw } from 'lucide-react';
import api from '../api/api';
import VehicleModal from '../components/VehicleModal';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const statusColors = {
    AVAILABLE: 'bg-green-100 text-green-700',
    ON_TRIP: 'bg-blue-100 text-blue-700',
    IN_SHOP: 'bg-orange-100 text-orange-700',
    RETIRED: 'bg-red-100 text-red-700',
};

const ALL_STATUSES = ['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED'];

// Dropdown menu per row — uses fixed positioning to escape overflow:hidden ancestors
const ActionMenu = ({ vehicle, onEdit, onDelete, onStatusChange }) => {
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const btnRef = useRef(null);
    const menuRef = useRef(null);

    // Position the fixed dropdown below the trigger button
    const handleOpen = () => {
        const rect = btnRef.current.getBoundingClientRect();
        setCoords({
            top: rect.bottom + 4,
            left: rect.right - 208, // 208 = w-52 (13rem)
        });
        setOpen(o => !o);
    };

    // Close on outside click
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

    const isStatusLocked = vehicle.status === 'ON_TRIP' || vehicle.status === 'IN_SHOP';
    const otherStatuses = isStatusLocked ? [] : ALL_STATUSES.filter(s => s !== vehicle.status);

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
                        className="w-52 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden"
                    >
                        {/* Edit */}
                        <button
                            onClick={() => { onEdit(vehicle); setOpen(false); }}
                            className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <Pencil size={15} className="text-primary-500" />
                            <span>Edit Details</span>
                        </button>

                        {/* Change Status */}
                        {otherStatuses.length > 0 ? (
                            <>
                                <div className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100 bg-slate-50">
                                    Change Status
                                </div>
                                {otherStatuses.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => { onStatusChange(vehicle._id, s); setOpen(false); }}
                                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                    >
                                        <RefreshCw size={13} className="text-slate-400" />
                                        <span>{s.replace('_', ' ')}</span>
                                    </button>
                                ))}
                            </>
                        ) : isStatusLocked && (
                            <div className="px-4 py-2.5 text-[10px] text-slate-400 italic border-t border-slate-100 bg-slate-50">
                                {vehicle.status === 'ON_TRIP'
                                    ? "Status locked during active trip"
                                    : "Status locked (In Maintenance)"}
                            </div>
                        )}

                        {/* Delete */}
                        <div className="border-t border-slate-100">
                            <button
                                onClick={() => {
                                    if (isStatusLocked) {
                                        toast.error(`Cannot delete a vehicle that is ${vehicle.status.replace('_', ' ')}`);
                                        setOpen(false);
                                        return;
                                    }
                                    onDelete(vehicle);
                                    setOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm transition-colors ${isStatusLocked ? 'text-slate-300 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'}`}
                            >
                                <Trash2 size={15} />
                                <span>Delete Vehicle</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};


// Confirm-delete overlay
const DeleteConfirmModal = ({ vehicle, onConfirm, onCancel }) => {
    if (!vehicle) return null;
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
                    <h3 className="text-lg font-bold text-slate-900">Delete Vehicle?</h3>
                    <p className="text-sm text-slate-500 mt-1">
                        <strong>{vehicle.name}</strong> ({vehicle.licensePlate}) will be permanently removed.
                        This action cannot be undone.
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
                        Yes, Delete
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const Vehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [deletingVehicle, setDeletingVehicle] = useState(null);

    useEffect(() => { fetchVehicles(); }, []);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/vehicles');
            setVehicles(data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch vehicles');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (vehicle) => {
        setEditingVehicle(vehicle);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingVehicle(null);
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await api.put(`/vehicles/${id}`, { status: newStatus });
            toast.success(`Status changed to ${newStatus.replace('_', ' ')}`);
            fetchVehicles();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update status');
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deletingVehicle) return;
        try {
            await api.delete(`/vehicles/${deletingVehicle._id}`);
            toast.success(`${deletingVehicle.name} removed from fleet`);
            setDeletingVehicle(null);
            fetchVehicles();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to delete vehicle');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Vehicle Registry</h1>
                    <p className="text-slate-500">Manage your fleet assets and status</p>
                </div>
                <button
                    onClick={() => { setEditingVehicle(null); setIsModalOpen(true); }}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors"
                >
                    <Plus size={20} />
                    <span>Add Vehicle</span>
                </button>
            </div>

            <VehicleModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onRefresh={fetchVehicles}
                vehicle={editingVehicle}
            />

            <DeleteConfirmModal
                vehicle={deletingVehicle}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeletingVehicle(null)}
            />

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by license plate..."
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
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Vehicle Name</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">License Plate</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Type</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Odometer</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500 italic">Fetching vehicles...</td></tr>
                        ) : vehicles.length === 0 ? (
                            <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500 italic">No assets found in registry</td></tr>
                        ) : vehicles.map((v) => (
                            <tr key={v._id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="font-semibold text-slate-900">{v.name}</p>
                                </td>
                                <td className="px-6 py-4 font-mono text-slate-600 text-sm">{v.licensePlate}</td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-medium text-slate-500">{v.type}</span>
                                </td>
                                <td className="px-6 py-4 text-slate-600 font-mono text-sm">{v.odometer?.toLocaleString()} km</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${statusColors[v.status]}`}>
                                        {v.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <ActionMenu
                                        vehicle={v}
                                        onEdit={handleEdit}
                                        onDelete={setDeletingVehicle}
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

export default Vehicles;
