import React, { useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useDropdown } from '../../hooks/useDropdown';
import { classOptions } from '../../data';

const ClassFilter: React.FC = () => {
  const { date, selectedClass, setDate, setSelectedClass } = useAppContext();
  const classDropdown = useDropdown();
  
  // Set current date when component mounts
  useEffect(() => {
    // Format today's date as YYYY-MM-DD for the date input
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setDate(formattedDate);
  }, [setDate]);

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
      {/* Date Picker */}
      <div className="relative w-full sm:w-auto">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <i className="fas fa-calendar-alt text-gray-400"></i>
        </div>
        <input
          type="date"
          className="w-full sm:w-auto pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      
      {/* Class/Year Dropdown */}
      <div className="relative w-full sm:w-auto">
        <button
          type="button"
          className="inline-flex justify-between w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          onClick={classDropdown.toggle}
        >
          <span>{selectedClass}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        {classDropdown.isOpen && (
          <div className="origin-top-right absolute right-0 mt-2 w-full sm:w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
            <div className="py-1" role="menu" aria-orientation="vertical">
              {classOptions.map(option => (
                <button
                  key={option.id}
                  type="button"
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedClass(option.name);
                    classDropdown.close();
                  }}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassFilter;