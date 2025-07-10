import React from 'react';
import { useAppContext } from '../../context/AppContext';

const ActionButtons: React.FC = () => {
  const { markAllAs } = useAppContext();

  return (
    <div className="flex justify-end mb-4 space-x-3">
      <button
        className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-md hover:shadow-lg"
        onClick={() => markAllAs(true)}
      >
        <i className="fas fa-check mr-2"></i>
        Mark All Present
      </button>
      <button
        className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-md hover:shadow-lg"
        onClick={() => markAllAs(false)}
      >
        <i className="fas fa-times mr-2"></i>
        Mark All Absent
      </button>
    </div>
  );
};

export default ActionButtons;