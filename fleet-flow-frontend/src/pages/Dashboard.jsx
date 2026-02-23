import { useEffect, useState } from 'react';
import { Truck, MapPin, Wrench, ListTodo, AlertCircle } from 'lucide-react';
import api from '../api/api';
import KPICard from '../components/KPICard';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/analytics/dashboard');
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div className="space-y-6 lg:space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Command Center</h1>
                    <p className="text-slate-500 text-sm sm:text-base">Real-time fleet performance overview</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <KPICard
                    title="Active Fleet"
                    value={stats?.activeFleet || 0}
                    icon={Truck}
                    color="blue"
                    subtitle="Vehicles OnTrip right now"
                />
                <KPICard
                    title="Maintenance"
                    value={stats?.inShop || 0}
                    icon={Wrench}
                    color="orange"
                    subtitle="Vehicles currently InShop"
                />
                <KPICard
                    title="Utilization"
                    value={`${stats?.utilization || 0}%`}
                    icon={MapPin}
                    color="green"
                    subtitle="Assigned vs Total assets"
                />
                <KPICard
                    title="Pending Trips"
                    value={stats?.pendingTrips || 0}
                    icon={ListTodo}
                    color="purple"
                    subtitle="Draft status logs"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold mb-6">Fleet Utilization Trend</h3>
                    <div className="h-64 flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl italic text-sm">
                        Chart integration placeholder
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold mb-6 flex items-center">
                        <AlertCircle size={20} className="text-orange-500 mr-2" />
                        Priority Alerts
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                            <p className="text-sm font-semibold text-orange-900">Vehicle ABC-1234 Due for Service</p>
                            <p className="text-xs text-orange-700">Scheduled: 3 days ago</p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                            <p className="text-sm font-semibold text-red-900">Driver License Expiry</p>
                            <p className="text-xs text-red-700">Michael D. (DL-9988) - 15 days left</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
