import React from 'react';
import { motion } from 'framer-motion';

const Navbar = ({ tabs, currentTab, onTabChange, overview }) => {
  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">HiringSight</h1>
                <p className="text-sm text-gray-600">AI-Powered Talent Intelligence</p>
              </div>
            </div>
          </div>

          {overview && (
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{overview.total_candidates?.toLocaleString()}</div>
                <div className="text-xs text-gray-600">Total Candidates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{overview.average_score?.toFixed(1)}</div>
                <div className="text-xs text-gray-600">Avg Quality Score</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-1 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              <span className={`relative z-10 ${
                currentTab === tab.id 
                  ? 'text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}>
                {tab.label}
              </span>
              
              {currentTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;