import React, { useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { LogOut } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import DashboardHome from './DashboardHome';
import BusinessesPage from './BusinessesPage';

const Dashboard = ({ user, onSignOut }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const isProfile = location.pathname === '/dashboard/profile';

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Dashboard Header */}
      <header className="bg-black border-b border-zinc-800">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-red-600 font-bold text-2xl">AIRA</h1>
            <nav className="flex space-x-6">
              <button
                onClick={() => navigate('/dashboard')}
                className={`flex items-center space-x-2 transition-colors ${
                  !isProfile ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => navigate('/dashboard/profile')}
                className={`flex items-center space-x-2 transition-colors ${
                  isProfile ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-white text-sm">{user.name}</p>
              <p className="text-gray-400 text-xs">{user.email}</p>
            </div>
            {user.picture && (
              <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
            )}
            <Button
              onClick={onSignOut}
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="container mx-auto px-6 py-8">
        {!isProfile && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">Welcome back, {user.name}!</h2>
          </div>
        )}
        <DashboardHome />
      </main>
    </div>
  );
};

export default Dashboard;