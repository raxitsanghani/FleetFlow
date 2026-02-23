import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Truck,
    Users,
    MapPin,
    Wrench,
    Fuel,
    BarChart3,
    LogOut,
    X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../logo.png';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'] },
        { name: 'Vehicles', icon: Truck, path: '/vehicles', roles: ['FLEET_MANAGER', 'DISPATCHER', 'FINANCIAL_ANALYST'] },
        { name: 'Drivers', icon: Users, path: '/drivers', roles: ['FLEET_MANAGER', 'SAFETY_OFFICER'] },
        { name: 'Trips', icon: MapPin, path: '/trips', roles: ['FLEET_MANAGER', 'DISPATCHER'] },
        { name: 'Maintenance', icon: Wrench, path: '/maintenance', roles: ['FLEET_MANAGER', 'DISPATCHER'] },
        { name: 'Fuel Logs', icon: Fuel, path: '/fuel', roles: ['FLEET_MANAGER', 'DISPATCHER', 'FINANCIAL_ANALYST'] },
        { name: 'Analytics', icon: BarChart3, path: '/analytics', roles: ['FLEET_MANAGER', 'FINANCIAL_ANALYST'] },
    ];

    const filteredItems = menuItems.filter(item => item.roles.includes(user?.role));

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <div className={`
                fixed inset-y-0 left-0 z-50
                w-64 h-screen bg-slate-900 text-white flex flex-col 
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center space-x-3">
                        <img src={logo} alt="FleetFlow Logo" className="w-10 h-10 object-contain" />
                        <h1 className="text-2xl font-bold text-primary-400">FleetFlow</h1>
                    </div>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 text-slate-400 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {filteredItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => {
                                if (window.innerWidth < 1024) onClose();
                            }}
                            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${location.pathname === item.path
                                ? 'bg-primary-600 text-white'
                                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                        >
                            <item.icon size={20} />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center space-x-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-xs font-bold">
                            {user?.name?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.role?.replace('_', ' ')}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center space-x-3 w-full p-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
