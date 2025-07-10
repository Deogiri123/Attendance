import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const Header: React.FC = () => {
  const location = useLocation();
  const { token, setToken } = useAppContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold">ClassManager</h1>
            </div>
            {/* Desktop Navigation */}
            <nav className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link
                  to="/"
                  className={`${
                    location.pathname === '/'
                      ? 'bg-gray-800'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } px-3 py-2 rounded-md text-sm font-medium`}
                >
                  Dashboard
                </Link>
                
                {token && (
                  <>
                    <Link
                      to="/students"
                      className={`${
                        location.pathname === '/students'
                          ? 'bg-gray-800'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      } px-3 py-2 rounded-md text-sm font-medium`}
                    >
                      Students
                    </Link>
                    <Link
                      to="/attendance"
                      className={`${
                        location.pathname === '/attendance'
                          ? 'bg-gray-800'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      } px-3 py-2 rounded-md text-sm font-medium`}
                    >
                      Attendance
                    </Link>
                    <Link
                      to="/teachers"
                      className={`${
                        location.pathname === '/teachers'
                          ? 'bg-gray-800'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      } px-3 py-2 rounded-md text-sm font-medium`}
                    >
                      Teachers
                    </Link>
                    <Link
                      to="/subjects"
                      className={`${
                        location.pathname === '/subjects'
                          ? 'bg-gray-800'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      } px-3 py-2 rounded-md text-sm font-medium`}
                    >
                      Subjects
                    </Link>
                    <Link
                      to="/reports"
                      className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Reports
                    </Link>
                    <Link
                      to="/settings"
                      className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Settings
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
          <div className="flex items-center">
            <div className="relative ml-3">
              <div className="flex space-x-2">
                {token ? (
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                    >
                      Login
                    </Link>
                  </>
                )}
              </div>
            </div>
            {/* Mobile menu button */}
            <button
              className="md:hidden flex items-center justify-center ml-3 p-2 rounded-md text-gray-300 hover:text-white focus:outline-none transition-colors duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-4 pt-2 pb-3 space-y-1 border-t border-blue-700 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 shadow-inner">
          <Link
            to="/"
            className={`${location.pathname === '/' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'} flex items-center w-full px-4 py-3 rounded-md text-base font-medium transition-colors duration-200`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          
          {token && (
            <>
              <Link
                to="/students"
                className={`${location.pathname === '/students' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'} flex items-center w-full px-4 py-3 rounded-md text-base font-medium transition-colors duration-200`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Students
              </Link>
              <Link
                to="/attendance"
                className={`${location.pathname === '/attendance' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'} flex items-center w-full px-4 py-3 rounded-md text-base font-medium transition-colors duration-200`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Attendance
              </Link>
              <Link
                to="/teachers"
                className={`${location.pathname === '/teachers' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'} flex items-center w-full px-4 py-3 rounded-md text-base font-medium transition-colors duration-200`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Teachers
              </Link>
              <Link
                to="/subjects"
                className={`${location.pathname === '/subjects' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'} flex items-center w-full px-4 py-3 rounded-md text-base font-medium transition-colors duration-200`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Subjects
              </Link>
              <Link
                to="/reports"
                className="text-gray-300 hover:bg-gray-700 hover:text-white flex items-center w-full px-4 py-3 rounded-md text-base font-medium transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Reports
              </Link>
              <Link
                to="/settings"
                className="text-gray-300 hover:bg-gray-700 hover:text-white flex items-center w-full px-4 py-3 rounded-md text-base font-medium transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Settings
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;