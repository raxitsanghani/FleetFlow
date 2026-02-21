import { useEffect, useState } from 'react';
import { Plus, Search, MoreVertical, Filter, User, Award, Shield, Star } from 'lucide-react';
import api from '../api/api';
import DriverModal from '../components/DriverModal';

const statusColors = {
    ON_DUTY: 'bg-green-100 text-green-700',
    OFF_DUTY: 'bg-slate-100 text-slate-700',
    SUSPENDED: 'bg-red-100 text-red-700',
    ON_TRIP: 'bg-blue-100 text-blue-700',
};

const Drivers = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/drivers');
            setDrivers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
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
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors"
                >
                    <Plus size={20} />
                    <span>Add Driver</span>
                </button>
            </div>

            <DriverModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onRefresh={fetchDrivers}
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
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200 uppercase">
                                            {d.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">{d.name}</p>
                                            <p className="text-xs text-slate-500 capitalize">{d.category.toLowerCase()}</p>
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
                                        <div className="flex text-yellow-500">
                                            <Star size={14} fill="currentColor" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-900">{d.safetyScore || 100}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${statusColors[d.status] || statusColors.OFF_DUTY}`}>
                                        {d.status?.replace('_', ' ') || 'OFF DUTY'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button className="text-slate-400 hover:text-slate-900 transition-colors">
                                        <MoreVertical size={18} />
                                    </button>
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
