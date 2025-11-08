import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, Phone, Calendar, TrendingUp } from 'lucide-react';

const DashboardHome = () => {
  const [stats] = useState({
    totalCalls: 1247,
    activeUsers: 89,
    appointments: 156,
    satisfaction: 94
  });

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Overview</h1>
        <p className="text-gray-600">Here's what's happening with AIRA today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Calls</CardTitle>
            <Phone className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalCalls}</div>
            <p className="text-xs text-gray-600 mt-1">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
            <Users className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.activeUsers}</div>
            <p className="text-xs text-gray-600 mt-1">+5% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Appointments</CardTitle>
            <Calendar className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.appointments}</div>
            <p className="text-xs text-gray-600 mt-1">+8% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Satisfaction</CardTitle>
            <TrendingUp className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.satisfaction}%</div>
            <p className="text-xs text-gray-600 mt-1">+2% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: '2 minutes ago', action: 'New appointment scheduled', user: 'John Doe' },
              { time: '15 minutes ago', action: 'Call handled successfully', user: 'Jane Smith' },
              { time: '1 hour ago', action: 'Customer inquiry resolved', user: 'Mike Johnson' },
              { time: '2 hours ago', action: 'New user registered', user: 'Sarah Williams' }
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-4 pb-4 border-b border-gray-200 last:border-0">
                <div className="bg-red-600 w-2 h-2 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-gray-900 text-sm">{activity.action}</p>
                  <p className="text-gray-600 text-xs mt-1">{activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default DashboardHome;