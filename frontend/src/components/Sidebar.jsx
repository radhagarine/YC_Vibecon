import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, FileText, Phone, BarChart3, Calendar, Settings } from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
    { icon: Building2, label: 'Profile', path: '/dashboard/profile' },
    { icon: FileText, label: 'Details', path: '/dashboard/details' },
    { icon: Phone, label: 'Numbers', path: '/dashboard/numbers' },
    { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics' },
    { icon: Calendar, label: 'Calendar', path: '/dashboard/calendar' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <img 
          src="/aira-logo.png" 
          alt="AIRA" 
          className="h-10 w-auto"
        />
      </div>

      {/* Navigation */}
      <nav className="p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                isActive
                  ? 'bg-red-50 text-red-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;