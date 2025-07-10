import React from 'react';
import ActivityItem from './ActivityItem';
import { activityData } from '../../data';

const ActivityFeed: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
      <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-6">Recent Activity</h2>
      <div className="space-y-4">
        {activityData.map(activity => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
      <div className="mt-4">
        <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
          View all activity
          <i className="fas fa-arrow-right ml-1"></i>
        </a>
      </div>
    </div>
  );
};

export default ActivityFeed;