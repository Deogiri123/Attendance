import React from 'react';
import StatsGrid from '../components/dashboard/StatsGrid';
import AttendanceTable from '../components/attendance/AttendanceTable';
import AttendanceChart from '../components/charts/AttendanceChart';
import ActivityFeed from '../components/activity/ActivityFeed';

const Dashboard: React.FC = () => {
  return (
    <main className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, Professor. Here's what's happening today.</p>
      </div>
      
      {/* Stats Cards */}
      <StatsGrid />
      
      {/* Attendance Section */}
      <AttendanceTable />
      
      {/* Charts & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attendance Chart */}
        <AttendanceChart />
        
        {/* Recent Activity */}
        <ActivityFeed />
      </div>
    </main>
  );
};

export default Dashboard;