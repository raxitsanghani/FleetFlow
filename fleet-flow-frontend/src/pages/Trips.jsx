import { useEffect, useState } from 'react';
import { Plus, Search, MoreVertical, Filter, Navigation, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import api from '../api/api';
import TripModal from '../components/TripModal';
import { toast } from 'react-toastify';

const statusStyles = {
    DRAFT: { color: 'bg-slate-100 text-slate-700', icon: Clock },
    DISPATCHED: { color: 'bg-blue-100 text-blue-700', icon: Navigation },
    COMPLETED: { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    CANCELLED: { color: 'bg-red-100 text-red-700', icon: AlertCircle },
};

const Trips = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const handleComplete = async (id) => {
        const endOdo = prompt('Enter end odometer reading:');
        if (!endOdo) return;

        const revenue = prompt('Enter trip revenue:');
        if (!revenue) return;

        try {
            await api.put(`/trips/${id}/complete`, {
                endOdometer: Number(endOdo),
                revenue: Number(revenue)
            });
            toast.success('Trip marked as completed!');
            fetchTrips();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to complete trip');
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
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors"
                >
                    <Plus size={20} />
                    <span>New Assignment</span>
                </button>
            </div>

            <TripModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onRefresh={fetchTrips}
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

                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Assignment</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Operator</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Cargo</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Timing</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
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
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-1 text-slate-600">
                                            <span className="text-sm font-bold">{t.cargoWeight.toLocaleString()}</span>
                                            <span className="text-[10px] text-slate-400">kg</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${Style.color}`}>
                                            <Style.icon size={12} />
                                            <span>{t.status}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs text-slate-500">
                                            {new Date(t.createdAt).toLocaleDateString()}
                                        </p>
                                        <p className="text-[10px] text-slate-400">
                                            {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            {t.status === 'DRAFT' && (
                                                <button
                                                    onClick={() => handleDispatch(t._id)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Dispatch Trip"
                                                >
                                                    <Navigation size={18} />
                                                </button>
                                            )}
                                            {t.status === 'DISPATCHED' && (
                                                <button
                                                    onClick={() => handleComplete(t._id)}
                                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Complete Trip"
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>
                                            )}
                                            <button className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Trips;
