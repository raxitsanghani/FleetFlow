import { useEffect, useState, useRef } from 'react';
import { Plus, Search, MoreVertical, Filter, Wrench, Clock, DollarSign, Calendar, Pencil, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';
import MaintenanceModal from '../components/MaintenanceModal';
import { toast } from 'react-toastify';

// Fixed-position dropdown to escape overflow constraints
const ActionMenu = ({ log, onEdit, onDelete }) => {
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
                        <button
                            onClick={() => { onEdit(log); setOpen(false); }}
                            className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <Pencil size={15} className="text-primary-500" />
                            <span>Edit Record</span>
                        </button>
                        <div className="border-t border-slate-100">
                            <button
                                onClick={() => { onDelete(log); setOpen(false); }}
                                className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <Trash2 size={15} />
                                <span>Delete Log</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// Confirm delete modal
const DeleteConfirmModal = ({ log, onConfirm, onCancel }) => {
    if (!log) return null;
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
                    <h3 className="text-lg font-bold text-slate-900">Delete Record?</h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Maintenance entry for <strong>{log.vehicle?.name}</strong> (${log.cost}) will be permanently removed.
                    </p>
                </div>
                <div className="flex space-x-3 pt-2">
                    <button onClick={onCancel} className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Delete
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const Maintenance = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLog, setEditingLog] = useState(null);
    const [deletingLog, setDeletingLog] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterVehicle, setFilterVehicle] = useState('ALL');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/maintenances');
            setLogs(data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch maintenance logs');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (log) => {
        setEditingLog(log);
        setIsModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingLog) return;
        try {
            await api.delete(`/maintenances/${deletingLog._id}`);
            toast.success('Maintenance record deleted');
            setDeletingLog(null);
            fetchLogs();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to delete record');
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            (log.vehicle?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.vehicle?.licensePlate || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.uid && log.uid.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesVehicle = filterVehicle === 'ALL' || log.vehicle?._id === filterVehicle;
        return matchesSearch && matchesVehicle;
    });

    const uniqueVehicles = Array.from(new Map(logs.map(log => [log.vehicle?._id, log.vehicle])).values()).filter(Boolean);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Service Logs</h1>
                    <p className="text-slate-500">Track vehicle repairs, maintenance, and operational costs</p>
                </div>
                <button
                    onClick={() => { setEditingLog(null); setIsModalOpen(true); }}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors"
                >
                    <Plus size={20} />
                    <span>Log Service</span>
                </button>
            </div>

            <MaintenanceModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingLog(null); }}
                onRefresh={fetchLogs}
                maintenance={editingLog}
            />

            <DeleteConfirmModal
                log={deletingLog}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeletingLog(null)}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                        <Wrench size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Filtered Services</p>
                        <p className="text-2xl font-bold text-slate-900">{filteredLogs.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Filtered Cost</p>
                        <p className="text-2xl font-bold text-slate-900">
                            ${filteredLogs.reduce((sum, log) => sum + log.cost, 0).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Last Service</p>
                        <p className="text-xl font-bold text-slate-900 truncate">
                            {logs.length > 0 ? new Date(logs[0].date).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by vehicle, description or ID..."
                            className="w-full pl-10 pr-4 py-2 text-gray-700 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 text-slate-500 text-sm">
                            <Filter size={18} />
                            <span>Vehicle:</span>
                        </div>
                        <select
                            className="text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 bg-white font-medium text-slate-700"
                            value={filterVehicle}
                            onChange={(e) => setFilterVehicle(e.target.value)}
                        >
                            <option value="ALL">All Vehicles</option>
                            {uniqueVehicles.map(v => (
                                <option key={v._id} value={v._id}>{v.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-nowrap">ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-nowrap">Vehicle</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-nowrap">Description</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-nowrap">Cost</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-nowrap">Service Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-nowrap text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500 italic">Loading service records...</td></tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500 italic">No maintenance history match your search/filters</td></tr>
                            ) : filteredLogs.map((log) => (
                                <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded leading-none uppercase">
                                            {log.uid || log._id.slice(-6)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-semibold text-slate-900">{log.vehicle?.name || 'Unknown'}</p>
                                            <p className="text-xs font-mono text-slate-500 uppercase">{log.vehicle?.licensePlate || 'N/A'}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs">
                                        <p className="text-sm text-slate-600 truncate" title={log.description}>
                                            {log.description}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-slate-900">${log.cost.toLocaleString()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2 text-slate-500">
                                            <Calendar size={14} />
                                            <span className="text-sm">{new Date(log.date).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <ActionMenu log={log} onEdit={handleEdit} onDelete={setDeletingLog} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Maintenance;
