import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-200 mt-16">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center">
            <h2 className="text-lg font-bold text-gray-900">ClassManager</h2>
            <p className="ml-2 text-sm text-gray-600">v2.5.3</p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-gray-900">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-4 md:mt-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col md:flex-row md:space-x-6">
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Help Center</a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 mt-2 md:mt-0">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 mt-2 md:mt-0">Terms of Service</a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 mt-2 md:mt-0">Contact Support</a>
          </div>
          <p className="text-sm text-gray-600 mt-4 md:mt-0">
            &copy; 2025 ClassManager. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;