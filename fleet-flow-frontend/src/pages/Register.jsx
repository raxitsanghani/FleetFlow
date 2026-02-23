import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Briefcase } from 'lucide-react';
import logo from '../logo.png';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'FLEET_MANAGER'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(formData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8 bg-primary-600 text-white flex flex-col items-center">
                    <img src={logo} alt="FleetFlow Logo" className="w-20 h-20 object-contain mb-4" />
                    <h2 className="text-2xl font-bold">FleetFlow</h2>
                    <p className="text-primary-100 italic">Join our enterprise fleet network</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <User size={16} /> Full Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 text-gray-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <Mail size={16} /> Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 text-gray-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            placeholder="manager@fleet.com"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <Briefcase size={16} /> Role
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-4 py-2 text-gray-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white"
                        >
                            <option value="FLEET_MANAGER">Fleet Manager</option>
                            <option value="DISPATCHER">Dispatcher</option>
                            <option value="SAFETY_OFFICER">Safety Officer</option>
                            <option value="FINANCIAL_ANALYST">Financial Analyst</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <Lock size={16} /> Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 text-gray-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-700 transition-colors disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>

                    <p className="text-center text-sm text-slate-500 mt-4">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-600 font-semibold hover:underline">
                            Sign In
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
