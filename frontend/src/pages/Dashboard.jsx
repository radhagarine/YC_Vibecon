import React, { useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { LogOut } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import DashboardHome from './DashboardHome';
import BusinessesPage from './BusinessesPage';

const Dashboard = ({ user, onSignOut }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Welcome back, {user.name}!
              </h2>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
            <div className="flex items-center space-x-4">
              {user.picture && (
                <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
              )}
              <Button
                onClick={onSignOut}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/profile" element={<BusinessesPage user={user} />} />
            <Route path="/details" element={<div className="text-gray-600">Details page coming soon...</div>} />
            <Route path="/numbers" element={<div className="text-gray-600">Numbers page coming soon...</div>} />
            <Route path="/analytics" element={<div className="text-gray-600">Analytics page coming soon...</div>} />
            <Route path="/calendar/*" element={<div className="text-gray-600">Calendar page coming soon...</div>} />
            <Route path="/settings" element={<div className="text-gray-600">Settings page coming soon...</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;