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
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Logo Section - White background, aligned with top nav bar height */}
      <div className="h-16 flex items-center px-4 bg-white dark:bg-gray-700 border-b border-gray-200">
        {/* Hamburger Menu */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="bg-white dark:bg-gray-700 p-2 rounded-lg transition-colors focus:outline-none hover:bg-white/80 dark:hover:bg-gray-600"
          type="button"
        >
          <Menu className="w-7 h-7 text-gray-600 dark:text-gray-400" />
        </button>
        
        {/* Logo */}
        {!isCollapsed && (
          <div className="flex-grow flex justify-start items-center pl-4">
            <a className="block" href="/">
              <div className="flex items-center justify-center transition-opacity duration-200" style={{ width: '130px', height: '42px' }}>
                <img 
                  alt="AIRA Logo" 
                  width="130" 
                  height="42" 
                  decoding="async" 
                  data-nimg="1" 
                  className="object-contain" 
                  src="/aira-logo.png"
                  style={{ color: 'transparent' }}
                />
              </div>
            </a>
          </div>
        )}
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