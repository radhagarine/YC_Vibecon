import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Users, Phone, Calendar, TrendingUp, LogOut } from 'lucide-react';

const Dashboard = ({ user, onSignOut }) => {
  const navigate = useNavigate();
  const [stats] = useState({
    totalCalls: 1247,
    activeUsers: 89,
    appointments: 156,
    satisfaction: 94
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Dashboard Header */}
      <header className="bg-black border-b border-zinc-800">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-red-600 font-bold text-2xl">AIRA</h1>
            <span className="text-gray-400">Dashboard</span>
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {user.name}!</h2>
          <p className="text-gray-400">Here's what's happening with AIRA today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Calls</CardTitle>
              <Phone className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.totalCalls}</div>
              <p className="text-xs text-gray-400 mt-1">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Users</CardTitle>
              <Users className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.activeUsers}</div>
              <p className="text-xs text-gray-400 mt-1">+5% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Appointments</CardTitle>
              <Calendar className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.appointments}</div>
              <p className="text-xs text-gray-400 mt-1">+8% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Satisfaction</CardTitle>
              <TrendingUp className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.satisfaction}%</div>
              <p className="text-xs text-gray-400 mt-1">+2% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { time: '2 minutes ago', action: 'New appointment scheduled', user: 'John Doe' },
                { time: '15 minutes ago', action: 'Call handled successfully', user: 'Jane Smith' },
                { time: '1 hour ago', action: 'Customer inquiry resolved', user: 'Mike Johnson' },
                { time: '2 hours ago', action: 'New user registered', user: 'Sarah Williams' }
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-4 pb-4 border-b border-zinc-700 last:border-0">
                  <div className="bg-red-600 w-2 h-2 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{activity.action}</p>
                    <p className="text-gray-400 text-xs mt-1">{activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;