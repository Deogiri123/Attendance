import React from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: string;
  iconBg: string;
  iconColor: string;
  trend: {
    value: string;
    isPositive: boolean;
    text: string;
  };
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  iconBg, 
  iconColor,
  trend 
}) => {
  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-md p-8 transition-all duration-300 hover:shadow-xl hover:scale-105 border border-gray-100">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${iconBg} ${iconColor}`}>
          <i className={`fas fa-${icon} text-xl`}></i>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center text-sm">
          <span className={`${trend.isPositive ? 'text-green-500' : 'text-red-500'} flex items-center`}>
            <i className={`fas fa-arrow-${trend.isPositive ? 'up' : 'down'} mr-1`}></i>
            {trend.value}
          </span>
          <span className="text-gray-500 ml-2">{trend.text}</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;