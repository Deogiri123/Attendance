import React from 'react';
import { Activity } from '../../types';

interface ActivityItemProps {
  activity: Activity;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  return (
    <div className="flex">
      <div className="flex-shrink-0">
        <div className={`flex items-center justify-center h-8 w-8 rounded-full ${activity.iconBg} ${activity.iconColor}`}>
          <i className={`fas fa-${activity.icon} text-sm`}></i>
        </div>
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
        <p className="text-xs text-gray-500">{activity.description}</p>
        <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
      </div>
    </div>
  );
};

export default ActivityItem;