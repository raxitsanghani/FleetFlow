import { useEffect, useState, useRef } from 'react';
import { Plus, Search, MoreVertical, Filter, Navigation, CheckCircle2, AlertCircle, Clock, Pencil, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';
import TripModal from '../components/TripModal';
import CompleteTripModal from '../components/CompleteTripModal';
import { toast } from 'react-toastify';

const statusStyles = {
    DRAFT: { color: 'bg-slate-100 text-slate-700', icon: Clock },
    DISPATCHED: { color: 'bg-blue-100 text-blue-700', icon: Navigation },
    COMPLETED: { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    CANCELLED: { color: 'bg-red-100 text-red-700', icon: AlertCircle },
};

// Fixed-position dropdown
const ActionMenu = ({ trip, onEdit, onDelete, onDispatch, onComplete }) => {
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const btnRef = useRef(null);
    const menuRef = useRef(null);

    const handleOpen = () => {
        const rect = btnRef.current.getBoundingClientRect();
        setCoords({ top: rect.bottom + 4, left: rect.right - 180 });
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
                        className="w-44 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden"
                    >
                        {trip.status === 'DRAFT' && (
                            <button
                                onClick={() => { onDispatch(trip._id); setOpen(false); }}
                                className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                                <Navigation size={15} />
                                <span>Dispatch Now</span>
                            </button>
                        )}
                        {trip.status === 'DISPATCHED' && (
                            <button
                                onClick={() => { onComplete(trip); setOpen(false); }}
                                className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 transition-colors"
                            >
                                <CheckCircle2 size={15} />
                                <span>Mark Complete</span>
                            </button>
                        )}
                        {trip.status === 'DRAFT' && (
                            <button
                                onClick={() => { onEdit(trip); setOpen(false); }}
                                className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                <Pencil size={15} className="text-primary-500" />
                                <span>Edit Draft</span>
                            </button>
                        )}
                        <div className="border-t border-slate-100">
                            <button
                                onClick={() => { onDelete(trip); setOpen(false); }}
                                className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <Trash2 size={15} />
                                <span>Delete Trip</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// Confirm delete modal
const DeleteConfirmModal = ({ trip, onConfirm, onCancel }) => {
    if (!trip) return null;
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
                    <h3 className="text-lg font-bold text-slate-900">Delete Trip?</h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Trip for <strong>{trip.vehicle?.name}</strong> will be removed.
                        {trip.status === 'DISPATCHED' && " Vehicle and driver will be set back to available."}
                    </p>
                </div>
                <div className="flex space-x-3 pt-2">
                    <button onClick={onCancel} className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors font-semibold">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold">
                        Yes, Delete
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const Trips = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTrip, setEditingTrip] = useState(null);
    const [completingTrip, setCompletingTrip] = useState(null);
    const [deletingTrip, setDeletingTrip] = useState(null);

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/trips');
            setTrips(data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch trips');
        } finally {
            setLoading(false);
        }
    };

    const handleDispatch = async (id) => {
        try {
            await api.put(`/trips/${id}/dispatch`);
            toast.success('Trip dispatched successfully!');
            fetchTrips();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to dispatch trip');
        }
    };

    const handleEdit = (trip) => {
        setEditingTrip(trip);
        setIsModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingTrip) return;
        try {
            await api.delete(`/trips/${deletingTrip._id}`);
            toast.success('Trip assignment removed');
            setDeletingTrip(null);
            fetchTrips();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to delete trip');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Trip Dispatch Center</h1>
                    <p className="text-slate-500">Coordinate and track active vehicle assignments</p>
                </div>
                <button
                    onClick={() => { setEditingTrip(null); setIsModalOpen(true); }}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors"
                >
                    <Plus size={20} />
                    <span>New Assignment</span>
                </button>
            </div>

            <TripModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingTrip(null); }}
                onRefresh={fetchTrips}
                trip={editingTrip}
            />

            <CompleteTripModal
                trip={completingTrip}
                isOpen={!!completingTrip}
                onClose={() => setCompletingTrip(null)}
                onRefresh={fetchTrips}
            />

            <DeleteConfirmModal
                trip={deletingTrip}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeletingTrip(null)}
            />

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search trips..."
                            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <button className="flex items-center space-x-2 text-slate-500 text-sm hover:text-slate-900 transition-colors">
                        <Filter size={18} />
                        <span>Filters</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Assignment</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Operator</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-center">Weight</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-center">Timing</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500 italic">Synchronizing dispatch data...</td></tr>
                            ) : trips.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500 italic">No scheduled trips found</td></tr>
                            ) : trips.map((t) => {
                                const Style = statusStyles[t.status];
                                return (
                                    <tr key={t._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-slate-900">{t.vehicle?.name || 'Unknown'}</p>
                                                <p className="text-xs font-mono text-slate-500 uppercase">{t.vehicle?.licensePlate || 'N/A'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-slate-700">{t.driver?.name || 'Unassigned'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center space-x-1 text-slate-600">
                                                <span className="text-sm font-bold">{t.cargoWeight.toLocaleString()}</span>
                                                <span className="text-[10px] text-slate-400">kg</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-nowrap">
                                            <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${Style.color}`}>
                                                <Style.icon size={12} />
                                                <span>{t.status}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <p className="text-xs text-slate-500">
                                                {new Date(t.createdAt).toLocaleDateString()}
                                            </p>
                                            <p className="text-[10px] text-slate-400">
                                                {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <ActionMenu
                                                trip={t}
                                                onEdit={handleEdit}
                                                onDelete={setDeletingTrip}
                                                onDispatch={handleDispatch}
                                                onComplete={setCompletingTrip}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Trips;
