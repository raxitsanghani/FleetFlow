import { Menu, Bell } from 'lucide-react';
import logo from '../logo.png';

const Navbar = ({ onMenuClick }) => {
    return (
        <header className="lg:hidden bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sticky top-0 z-30">
            <div className="flex items-center space-x-3">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <Menu size={24} />
                </button>
                <div className="flex items-center space-x-2">
                    <img src={logo} alt="FleetFlow Logo" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-slate-900">FleetFlow</span>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
            </div>
        </header>
    );
};

export default Navbar;
