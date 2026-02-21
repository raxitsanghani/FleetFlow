import { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement, ArcElement,
    LineElement, PointElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
    Truck, Users, MapPin, Wrench, Fuel, DollarSign,
    TrendingUp, Activity, AlertTriangle, CheckCircle2
} from 'lucide-react';
import api from '../api/api';

ChartJS.register(
    CategoryScale, LinearScale, BarElement, ArcElement,
    LineElement, PointElement, Title, Tooltip, Legend, Filler
);

const chartDefaults = {
    plugins: { legend: { display: false } },
    maintainAspectRatio: false,
    scales: {
        x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
        y: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8' } }
    }
};

const KPICard = ({ icon: Icon, label, value, sub, color }) => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon size={22} />
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
    </div>
);

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [vRes, dRes, tRes, mRes, fRes] = await Promise.all([
                    api.get('/vehicles'),
                    api.get('/drivers'),
                    api.get('/trips'),
                    api.get('/maintenances'),
                    api.get('/fuel'),
                ]);
                setData({
                    vehicles: vRes.data,
                    drivers: dRes.data,
                    trips: tRes.data,
                    maintenances: mRes.data,
                    fuel: fRes.data,
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>
    );

    const { vehicles, drivers, trips, maintenances, fuel } = data;

    // --- KPIs ---
    const totalVehicles = vehicles.length;
    const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE').length;
    const onTripVehicles = vehicles.filter(v => v.status === 'ON_TRIP').length;
    const inShopVehicles = vehicles.filter(v => v.status === 'IN_SHOP').length;

    const totalDrivers = drivers.length;
    const activeDrivers = drivers.filter(d => d.status === 'ON_DUTY' || d.status === 'ON_TRIP').length;
    const suspendedDrivers = drivers.filter(d => d.status === 'SUSPENDED').length;
    const avgSafety = drivers.length ? (drivers.reduce((s, d) => s + (d.safetyScore || 100), 0) / drivers.length).toFixed(1) : 0;

    const completedTrips = trips.filter(t => t.status === 'COMPLETED');
    const totalRevenue = completedTrips.reduce((s, t) => s + (t.revenue || 0), 0);
    const totalFuelCost = fuel.reduce((s, f) => s + f.cost, 0);
    const totalFuelLiters = fuel.reduce((s, f) => s + f.liters, 0);
    const totalMaintenanceCost = maintenances.reduce((s, m) => s + m.cost, 0);
    const totalCost = totalFuelCost + totalMaintenanceCost;
    const netProfit = totalRevenue - totalCost;

    const totalKms = completedTrips.reduce((s, t) => {
        if (t.endOdometer && t.startOdometer) return s + (t.endOdometer - t.startOdometer);
        return s;
    }, 0);

    // --- Vehicle Fleet Status Chart ---
    const fleetStatusChart = {
        labels: ['Available', 'On Trip', 'In Shop', 'Retired'],
        datasets: [{
            data: [
                vehicles.filter(v => v.status === 'AVAILABLE').length,
                vehicles.filter(v => v.status === 'ON_TRIP').length,
                vehicles.filter(v => v.status === 'IN_SHOP').length,
                vehicles.filter(v => v.status === 'RETIRED').length,
            ],
            backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#94a3b8'],
            borderWidth: 0,
        }]
    };

    // --- Monthly Fuel Cost Chart (last 6 months) ---
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        return { label: d.toLocaleString('default', { month: 'short' }), year: d.getFullYear(), month: d.getMonth() };
    });

    const monthlyFuel = months.map(m =>
        fuel.filter(f => {
            const d = new Date(f.date);
            return d.getMonth() === m.month && d.getFullYear() === m.year;
        }).reduce((s, f) => s + f.cost, 0)
    );

    const monthlyMaintenance = months.map(m =>
        maintenances.filter(mx => {
            const d = new Date(mx.date);
            return d.getMonth() === m.month && d.getFullYear() === m.year;
        }).reduce((s, mx) => s + mx.cost, 0)
    );

    const costTrendChart = {
        labels: months.map(m => m.label),
        datasets: [
            {
                label: 'Fuel Cost',
                data: monthlyFuel,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59,130,246,0.1)',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Maintenance Cost',
                data: monthlyMaintenance,
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245,158,11,0.1)',
                fill: true,
                tension: 0.4,
            }
        ]
    };

    // --- Monthly revenue ---
    const monthlyRevenue = months.map(m =>
        completedTrips.filter(t => {
            const d = new Date(t.createdAt);
            return d.getMonth() === m.month && d.getFullYear() === m.year;
        }).reduce((s, t) => s + (t.revenue || 0), 0)
    );

    const revenueChart = {
        labels: months.map(m => m.label),
        datasets: [{
            label: 'Revenue',
            data: monthlyRevenue,
            backgroundColor: 'rgba(34,197,94,0.85)',
            borderRadius: 8,
        }]
    };

    // --- Driver status chart ---
    const driverStatusChart = {
        labels: ['On Duty', 'Off Duty', 'On Trip', 'Suspended'],
        datasets: [{
            data: [
                drivers.filter(d => d.status === 'ON_DUTY').length,
                drivers.filter(d => d.status === 'OFF_DUTY').length,
                drivers.filter(d => d.status === 'ON_TRIP').length,
                drivers.filter(d => d.status === 'SUSPENDED').length,
            ],
            backgroundColor: ['#22c55e', '#94a3b8', '#3b82f6', '#ef4444'],
            borderWidth: 0,
        }]
    };

    // --- Per-vehicle ROI ---
    const topVehicles = vehicles
        .map(v => {
            const vTrips = completedTrips.filter(t => (t.vehicleId?._id || t.vehicleId) === (v._id || v.id));
            const vFuel = fuel.filter(f => (f.vehicleId?._id || f.vehicleId) === (v._id || v.id));
            const vMaint = maintenances.filter(m => (m.vehicleId?._id || m.vehicleId) === (v._id || v.id));
            const rev = vTrips.reduce((s, t) => s + (t.revenue || 0), 0);
            const cost = vFuel.reduce((s, f) => s + f.cost, 0) + vMaint.reduce((s, m) => s + m.cost, 0);
            const roi = v.acquisitionCost > 0 ? ((rev - cost) / v.acquisitionCost * 100).toFixed(1) : 0;
            return { name: v.name, roi: Number(roi), revenue: rev, cost };
        })
        .sort((a, b) => b.roi - a.roi)
        .slice(0, 6);

    const roiChart = {
        labels: topVehicles.map(v => v.name),
        datasets: [{
            label: 'ROI %',
            data: topVehicles.map(v => v.roi),
            backgroundColor: topVehicles.map(v => v.roi >= 0 ? 'rgba(34,197,94,0.8)' : 'rgba(239,68,68,0.8)'),
            borderRadius: 8,
        }]
    };

    const doughnutOptions = {
        plugins: { legend: { position: 'right', labels: { color: '#64748b', font: { size: 12 } } } },
        maintainAspectRatio: false,
        cutout: '65%',
    };

    const lineOptions = {
        ...chartDefaults,
        plugins: { legend: { display: true, labels: { color: '#64748b', font: { size: 12 } } } },
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Fleet Analytics</h1>
                <p className="text-slate-500">Comprehensive operational insights across your entire fleet</p>
            </div>

            {/* KPI Row 1 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard icon={Truck} label="Total Vehicles" value={totalVehicles}
                    sub={`${availableVehicles} available · ${onTripVehicles} on trip`}
                    color="bg-blue-50 text-blue-600" />
                <KPICard icon={Users} label="Total Drivers" value={totalDrivers}
                    sub={`${activeDrivers} active · ${suspendedDrivers} suspended`}
                    color="bg-purple-50 text-purple-600" />
                <KPICard icon={MapPin} label="Trips (All)" value={trips.length}
                    sub={`${completedTrips.length} completed`}
                    color="bg-green-50 text-green-600" />
                <KPICard icon={Activity} label="Avg Safety Score" value={avgSafety}
                    sub="Across all drivers"
                    color="bg-yellow-50 text-yellow-600" />
            </div>

            {/* KPI Row 2 — Financial */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard icon={DollarSign} label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`}
                    sub="From completed trips"
                    color="bg-emerald-50 text-emerald-600" />
                <KPICard icon={Fuel} label="Fuel Spend" value={`$${totalFuelCost.toLocaleString()}`}
                    sub={`${totalFuelLiters.toFixed(0)} L consumed`}
                    color="bg-orange-50 text-orange-600" />
                <KPICard icon={Wrench} label="Maintenance Spend" value={`$${totalMaintenanceCost.toLocaleString()}`}
                    sub={`${maintenances.length} service records`}
                    color="bg-red-50 text-red-600" />
                <KPICard
                    icon={netProfit >= 0 ? TrendingUp : AlertTriangle}
                    label="Net Profit"
                    value={`${netProfit >= 0 ? '+' : ''}$${netProfit.toLocaleString()}`}
                    sub={`Over ${totalKms.toLocaleString()} km driven`}
                    color={netProfit >= 0 ? "bg-teal-50 text-teal-600" : "bg-red-50 text-red-600"} />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Fleet Status */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h3 className="font-semibold text-slate-900 mb-1">Fleet Status Breakdown</h3>
                    <p className="text-xs text-slate-400 mb-4">Current vehicle distribution</p>
                    <div style={{ height: 220 }}>
                        <Doughnut data={fleetStatusChart} options={doughnutOptions} />
                    </div>
                </div>

                {/* Driver Status */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h3 className="font-semibold text-slate-900 mb-1">Driver Workforce Status</h3>
                    <p className="text-xs text-slate-400 mb-4">Workforce availability</p>
                    <div style={{ height: 220 }}>
                        <Doughnut data={driverStatusChart} options={doughnutOptions} />
                    </div>
                </div>

                {/* Monthly Revenue */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h3 className="font-semibold text-slate-900 mb-1">Monthly Revenue</h3>
                    <p className="text-xs text-slate-400 mb-4">Completed trip earnings</p>
                    <div style={{ height: 220 }}>
                        <Bar data={revenueChart} options={{ ...chartDefaults, plugins: { legend: { display: false } } }} />
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cost Trend */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h3 className="font-semibold text-slate-900 mb-1">Operating Cost Trend</h3>
                    <p className="text-xs text-slate-400 mb-4">Fuel vs maintenance costs over 6 months</p>
                    <div style={{ height: 240 }}>
                        <Line data={costTrendChart} options={lineOptions} />
                    </div>
                </div>

                {/* Per-Vehicle ROI */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h3 className="font-semibold text-slate-900 mb-1">Vehicle ROI</h3>
                    <p className="text-xs text-slate-400 mb-4">Return on acquisition cost per vehicle</p>
                    <div style={{ height: 240 }}>
                        {topVehicles.length > 0 ? (
                            <Bar data={roiChart} options={{ ...chartDefaults, plugins: { legend: { display: false } } }} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 italic text-sm">
                                Complete some trips to see ROI data
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Top Vehicles Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-900">Vehicle Performance Leaderboard</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Ranked by ROI (revenue vs operating cost)</p>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">#</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Vehicle</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Revenue</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Operating Cost</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">ROI</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {topVehicles.length === 0 ? (
                            <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400 italic">No vehicle performance data yet</td></tr>
                        ) : topVehicles.map((v, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-slate-500 font-medium">#{i + 1}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold
                                            ${i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-orange-400' : 'bg-slate-200 text-slate-600'}`}>
                                            {i < 3 ? '★' : i + 1}
                                        </div>
                                        <span className="font-semibold text-slate-900">{v.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-700">${v.revenue.toLocaleString()}</td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-700">${v.cost.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${v.roi >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {v.roi >= 0 ? '+' : ''}{v.roi}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Analytics;
