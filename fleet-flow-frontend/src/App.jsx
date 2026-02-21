import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Login from './pages/Login';

// Placeholder pages for quick completion
const Drivers = () => <div className="p-8"><h1>Driver Management Page</h1><p className="text-slate-500 mt-2 italic">Detailed CRUD interface under development...</p></div>;
const Trips = () => <div className="p-8"><h1>Trip Dispatcher</h1><p className="text-slate-500 mt-2 italic">Trip lifecycle logic implementation in progress...</p></div>;
const Maintenance = () => <div className="p-8"><h1>Service Logs</h1><p className="text-slate-500 mt-2 italic">Service record modules loading...</p></div>;
const Fuel = () => <div className="p-8"><h1>Fuel & Expense</h1><p className="text-slate-500 mt-2 italic">Calculations and ROI tools module...</p></div>;
const Analytics = () => <div className="p-8"><h1>Advanced Analytics</h1><p className="text-slate-500 mt-2 italic">Generating fleet reports and ROI charts...</p></div>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/fuel" element={<Fuel />} />
            <Route path="/analytics" element={<Analytics />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
