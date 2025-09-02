import React from 'react';

const Navbar = ({ 
  tabs, 
  currentTab, 
  onTabChange, 
  overview, 
  selectedTeam, 
  compareList 
}) => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-6">
        {/* Top Line - Logo, Name, and Key Stats */}
        <div className="flex items-center justify-between h-16 border-b border-gray-100">
          {/* Left - Logo and Name (shifted right to align with tabs) */}
          <div className="flex items-center space-x-4 ml-8">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">HiringSight</h1>
              <p className="text-sm text-gray-500">AI-Powered Talent Intelligence</p>
            </div>
          </div>

          {/* Right - Key Stats */}
          <div className="flex items-center space-x-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {overview?.total_candidates?.toLocaleString() || '975'}
              </div>
              <div className="text-xs text-gray-500 font-medium">Total Candidates</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {overview?.average_score?.toFixed(1) || '68.2'}
              </div>
              <div className="text-xs text-gray-500 font-medium">Avg Quality Score</div>
            </div>
          </div>
        </div>

        {/* Bottom Line - Navigation Tabs */}
        <div className="flex items-center justify-center h-16">
          <div className="flex items-center space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  currentTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label.replace(/^[^\s]+\s/, '')}</span>
                </span>
                
                {/* Badge indicators */}
                {tab.id === 'team' && selectedTeam.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                    {selectedTeam.length}
                  </span>
                )}
                
                {tab.id === 'compare' && compareList.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                    {compareList.length}
                  </span>
                )}
                
                {tab.id === 'chemistry' && selectedTeam.length >= 2 && (
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-3 h-3"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          {/* Mobile Stats */}
          <div className="flex justify-center space-x-6 mb-4 py-2 border-b border-gray-100">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {overview?.total_candidates?.toLocaleString() || '975'}
              </div>
              <div className="text-xs text-gray-500">Candidates</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {overview?.average_score?.toFixed(1) || '68.2'}
              </div>
              <div className="text-xs text-gray-500">Avg Score</div>
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="grid grid-cols-4 gap-2">
            {tabs.slice(0, 4).map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative p-3 rounded-xl text-center transition-all duration-200 ${
                  currentTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="text-xl">{tab.icon}</div>
                <div className="text-xs font-medium mt-1">
                  {tab.label.replace(/^[^\s]+\s/, '').split(' ')[0]}
                </div>
                
                {tab.id === 'team' && selectedTeam.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {selectedTeam.length}
                  </span>
                )}
                
                {tab.id === 'compare' && compareList.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {compareList.length}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          {tabs.length > 4 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {tabs.slice(4).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative p-3 rounded-xl text-center transition-all duration-200 ${
                    currentTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-xl">{tab.icon}</div>
                  <div className="text-xs font-medium mt-1">
                    {tab.label.replace(/^[^\s]+\s/, '')}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;