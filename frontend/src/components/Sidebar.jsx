import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, FileText, Phone, BarChart3, Calendar, Settings, Menu } from 'lucide-react';
import { Button } from './ui/button';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <div 
      className={`bg-gradient-to-b from-red-900 via-red-800 to-red-900 min-h-screen transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo Section - Aligned with top nav bar height */}
      <div className="h-[72px] flex items-center justify-center border-b border-red-700/50 px-4">
        {!isCollapsed ? (
          <div 
            className="w-40 h-16 bg-contain bg-no-repeat bg-center"
            style={{ backgroundImage: 'url(/aira-logo.png)' }}
          />
        ) : (
          <div 
            className="w-12 h-12 bg-contain bg-no-repeat bg-center"
            style={{ backgroundImage: 'url(/aira-logo.png)' }}
          />
        )}
      </div>

      {/* Navigation */}
      <nav className="p-4">
        {/* Hamburger Menu Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-lg mb-4 transition-all text-red-100 hover:bg-red-800/50"
        >
          <Menu className="w-6 h-6 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium text-base">Menu</span>}
        </button>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-lg mb-2 transition-all ${
                isActive
                  ? 'bg-red-700 text-white'
                  : 'text-red-100 hover:bg-red-800/50'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.label : ''}
            >
              <Icon className="w-6 h-6 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium text-base">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;