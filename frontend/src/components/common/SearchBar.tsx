import React from 'react';
import { useAppContext } from '../../context/AppContext';

const SearchBar: React.FC = () => {
  const { searchQuery, setSearchQuery } = useAppContext();

  return (
    <div className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-search text-gray-400 text-sm"></i>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
              placeholder="Search for students, classes or reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;