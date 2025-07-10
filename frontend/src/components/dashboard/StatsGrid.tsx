import React from 'react';
import StatsCard from './StatsCard';
import { useAppContext } from '../../context/AppContext';

const StatsGrid: React.FC = () => {
  const { stats } = useAppContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
      <StatsCard
        title="Total Students"
        value={stats.totalStudents}
        icon="user-graduate"
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
        trend={{
          value: "3.2%",
          isPositive: true,
          text: "from last month"
        }}
      />
      
      <StatsCard
        title="Today's Attendance"
        value={stats.todayAttendance}
        icon="clipboard-check"
        iconBg="bg-green-100"
        iconColor="text-green-600"
        trend={{
          value: "1.8%",
          isPositive: true,
          text: "from yesterday"
        }}
      />
      
      <StatsCard
        title="Absent Students"
        value={stats.absentStudents}
        icon="user-times"
        iconBg="bg-red-100"
        iconColor="text-red-600"
        trend={{
          value: "2.5%",
          isPositive: false,
          text: "from yesterday"
        }}
      />
      
      <StatsCard
        title="Attendance Rate"
        value={`${stats.attendanceRate}%`}
        icon="chart-pie"
        iconBg="bg-purple-100"
        iconColor="text-purple-600"
        trend={{
          value: "0.5%",
          isPositive: true,
          text: "from last week"
        }}
      />
    </div>
  );
};

export default StatsGrid;