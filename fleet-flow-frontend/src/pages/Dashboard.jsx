import { useEffect, useState } from 'react';
import { Truck, MapPin, Wrench, ListTodo, AlertCircle, TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import api from '../api/api';
import KPICard from '../components/KPICard';
import ActivityFeed from '../components/ActivityFeed';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: '#1e293b',
            padding: 12,
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            cornerRadius: 8,
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            max: 100,
            grid: { display: true, color: '#f1f5f9' },
            ticks: { color: '#64748b', font: { size: 11 }, callback: (value) => `${value}%` }
        },
        x: {
            grid: { display: false },
            ticks: { color: '#64748b', font: { size: 11 } }
        }
    }
};

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

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    // Mock trend data for visualization (in a real app, this would come from an analytics endpoint)
    const utilizationData = {
        labels: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
        datasets: [{
            label: 'Utilization',
            data: [65, 59, 80, 81, 56, 40, stats?.utilization || 0],
            borderColor: '#0ea5e9',
            backgroundColor: 'rgba(14, 165, 233, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
        }]
    };

    return (
        <div className="space-y-8 pb-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Command Center</h1>
                    <p className="text-slate-500 font-medium">Intelligence and real-time fleet oversight</p>
                </div>
                <div className="hidden md:block bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex px-4 py-2 space-x-2 items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Live System</span>
                    </div>
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Active Fleet"
                    value={stats?.activeFleet || 0}
                    icon={Truck}
                    color="blue"
                    subtitle={`${stats?.totalVehicles || 0} Total Assets`}
                />
                <KPICard
                    title="Utilization"
                    value={`${stats?.utilization || 0}%`}
                    icon={TrendingUp}
                    color="green"
                    subtitle="Real-time occupancy"
                />
                <KPICard
                    title="Monthly Revenue"
                    value={`$${stats?.monthlyRevenue?.toLocaleString() || 0}`}
                    icon={DollarSign}
                    color="emerald"
                    subtitle="Current month total"
                />
                <KPICard
                    title="Monthly Expenses"
                    value={`$${stats?.monthlyExpenses?.toLocaleString() || 0}`}
                    icon={TrendingDown}
                    color="orange"
                    subtitle="Fuel + Maintenance"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Trends Chart */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Fleet Utilization</h3>
                                <p className="text-sm text-slate-500">Weekly performance trend</p>
                            </div>
                            <select className="text-xs font-bold text-slate-500 bg-slate-50 border-none rounded-lg px-3 py-2 outline-none">
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                            </select>
                        </div>
                        <div className="h-72">
                            <Line data={utilizationData} options={chartOptions} />
                        </div>
                    </div>

                    {/* Operational Alerts */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="text-xl font-bold mb-6 flex items-center text-slate-900">
                            <AlertCircle size={22} className="text-orange-500 mr-2" />
                            Operations Desk
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-5 bg-orange-50 rounded-2xl border border-orange-100 group hover:bg-orange-100 transition-colors cursor-pointer">
                                <p className="text-sm font-bold text-orange-900">Pending Approvals</p>
                                <p className="text-2xl font-black text-orange-600 mt-1">{stats?.pendingTrips || 0}</p>
                                <p className="text-xs text-orange-700 mt-1 uppercase font-bold tracking-wider">Draft status trips</p>
                            </div>
                            <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 group hover:bg-blue-100 transition-colors cursor-pointer">
                                <p className="text-sm font-bold text-blue-900">Maintenance Lock</p>
                                <p className="text-2xl font-black text-blue-600 mt-1">{stats?.inShop || 0}</p>
                                <p className="text-xs text-blue-700 mt-1 uppercase font-bold tracking-wider">Vehicles In-Shop</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Feed Sidebar */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-fit">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center">
                            <Activity size={20} className="mr-2 text-primary-600" />
                            Recent Activity
                        </h3>
                        <button className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:underline">View All</button>
                    </div>
                    <ActivityFeed activities={stats?.activities} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
