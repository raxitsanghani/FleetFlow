import { useEffect, useState } from 'react';
import { Plus, Search, MoreVertical, Filter } from 'lucide-react';
import api from '../api/api';

const statusColors = {
    AVAILABLE: 'bg-green-100 text-green-700',
    ON_TRIP: 'bg-blue-100 text-blue-700',
    IN_SHOP: 'bg-orange-100 text-orange-700',
    RETIRED: 'bg-red-100 text-red-700',
};

const Vehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const { data } = await api.get('/vehicles');
            setVehicles(data);
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
                    <h1 className="text-2xl font-bold text-slate-900">Vehicle Registry</h1>
                    <p className="text-slate-500">Manage your fleet assets and status</p>
                </div>
                <button className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors">
                    <Plus size={20} />
                    <span>Add Vehicle</span>
                </button>
            </div>

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
                            <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="font-semibold text-slate-900">{v.name}</p>
                                </td>
                                <td className="px-6 py-4 text-slate-600">{v.licensePlate}</td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-medium text-slate-500">{v.type}</span>
                                </td>
                                <td className="px-6 py-4 text-slate-600 font-mono">{v.odometer.toLocaleString()} km</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${statusColors[v.status]}`}>
                                        {v.status.replace('_', ' ')}
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

export default Vehicles;
