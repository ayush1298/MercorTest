import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Import all your components
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import CandidateExplorer from './components/CandidateExplorer';
import TeamBuilder from './components/TeamBuilder';
import InsightsPanel from './components/InsightsPanel';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import CandidateComparison from './components/Compare';   
import TeamChemistry from './components/TeamChemistryAnalyzer';
import LoadingSpinner from './components/LoadingSpinner';

const API_BASE = 'http://localhost:8000';

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [overview, setOverview] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [loading, setLoading] = useState(true);

  // All available tabs including Compare and Team Chemistry
  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'candidates', label: '👥 Candidates', icon: '👥' },
    { id: 'team', label: '🚀 Team Builder', icon: '🚀' },
    { id: 'compare', label: '⚖️ Compare', icon: '⚖️' },
    { id: 'chemistry', label: '🧪 Team Chemistry', icon: '🧪' },
    { id: 'analytics', label: '📈 Analytics', icon: '📈' },
    { id: 'insights', label: '🧠 AI Insights', icon: '🧠' }
  ];

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      console.log('Fetching overview from:', `${API_BASE}/api/v1/overview`);
      const response = await axios.get(`${API_BASE}/api/v1/overview`);
      console.log('Overview response:', response.data);
      setOverview(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching overview:', error);
      console.error('Error details:', error.response?.data);
      
      // Set fallback data if API fails
      setOverview({
        total_candidates: 975,
        average_score: 68.2,
        countries: 47,
        high_value_candidates: 162,
        skill_distribution: {
          'frontend': 245,
          'backend': 189,
          'data': 167,
          'mobile': 134,
          'cloud': 98,
          'devops': 87,
          'languages': 76
        },
        geographic_distribution: {
          'North America': 324,
          'Asia': 287,
          'Europe': 198,
          'South America': 166
        },
        experience_distribution: {
          'Junior': 234,
          'Mid-level': 456,
          'Senior': 285
        }
      });
      setLoading(false);
    }
  };

  const handleTabChange = (tabId) => {
    setCurrentTab(tabId);
  };

  // Team management functions
  const addToTeam = (candidate) => {
    if (selectedTeam.length < 8 && !selectedTeam.find(c => c.id === candidate.id)) {
      setSelectedTeam([...selectedTeam, candidate]);
      console.log('Added to team:', candidate.name);
    }
  };

  const removeFromTeam = (candidateId) => {
    setSelectedTeam(selectedTeam.filter(c => c.id !== candidateId));
    console.log('Removed from team:', candidateId);
  };

  const clearTeam = () => {
    setSelectedTeam([]);
    console.log('Team cleared');
  };

  // Compare list management functions
  const addToCompare = (candidate) => {
    if (compareList.length < 4 && !compareList.find(c => c.id === candidate.id)) {
      setCompareList([...compareList, candidate]);
      console.log('Added to compare:', candidate.name);
    }
  };

  const removeFromCompare = (candidateId) => {
    setCompareList(compareList.filter(c => c.id !== candidateId));
    console.log('Removed from compare:', candidateId);
  };

  const clearCompare = () => {
    setCompareList([]);
    console.log('Compare list cleared');
  };

  // Move candidate from compare to team
  const moveToTeam = (candidate) => {
    removeFromCompare(candidate.id);
    addToTeam(candidate);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const renderCurrentTab = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard 
            overview={overview} 
            apiBase={API_BASE}
            selectedTeam={selectedTeam}
            compareList={compareList}
          />
        );
        
      case 'candidates':
        return (
          <CandidateExplorer 
            selectedTeam={selectedTeam} 
            setSelectedTeam={setSelectedTeam}
            compareList={compareList}
            setCompareList={setCompareList}
            apiBase={API_BASE}
            onAddToTeam={addToTeam}
            onRemoveFromTeam={removeFromTeam}
            onAddToCompare={addToCompare}
            onRemoveFromCompare={removeFromCompare}
          />
        );
        
      case 'team':
        return (
          <TeamBuilder 
            selectedTeam={selectedTeam} 
            setSelectedTeam={setSelectedTeam}
            apiBase={API_BASE}
            onRemoveFromTeam={removeFromTeam}
            onClearTeam={clearTeam}
            onAddToTeam={addToTeam}
          />
        );
        
      case 'compare':
        return (
          <CandidateComparison
            compareList={compareList}
            setCompareList={setCompareList}
            apiBase={API_BASE}
            onRemoveFromCompare={removeFromCompare}
            onClearCompare={clearCompare}
            onMoveToTeam={moveToTeam}
            onAddToTeam={addToTeam}
          />
        );
        
      case 'chemistry':
        return (
          <TeamChemistry 
            selectedTeam={selectedTeam}
            apiBase={API_BASE}
            onRemoveFromTeam={removeFromTeam}
            onOptimizeTeam={setSelectedTeam}
          />
        );
        
      case 'analytics':
        return (
          <AnalyticsDashboard 
            apiBase={API_BASE}
            selectedTeam={selectedTeam}
            compareList={compareList}
          />
        );
        
      case 'insights':
        return (
          <InsightsPanel 
            apiBase={API_BASE}
            selectedTeam={selectedTeam}
            overview={overview}
          />
        );
        
      default:
        return <Dashboard overview={overview} apiBase={API_BASE} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        tabs={tabs}
        currentTab={currentTab}
        onTabChange={handleTabChange}
        overview={overview}
        selectedTeam={selectedTeam}
        compareList={compareList}
      />
      
      {/* Tab indicators for team and compare counts */}
      {(selectedTeam.length > 0 || compareList.length > 0) && (
        <div className="bg-white border-b border-gray-200 px-4 py-2">
          <div className="container mx-auto max-w-7xl flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {selectedTeam.length > 0 && (
                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                  <span className="text-blue-600 font-medium">🚀 Team:</span>
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    {selectedTeam.length}
                  </span>
                </div>
              )}
              
              {compareList.length > 0 && (
                <div className="flex items-center space-x-2 bg-purple-50 px-3 py-1 rounded-full">
                  <span className="text-purple-600 font-medium">⚖️ Compare:</span>
                  <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                    {compareList.length}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {compareList.length > 0 && (
                <button
                  onClick={() => setCurrentTab('compare')}
                  className="text-sm bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  View Comparison
                </button>
              )}
              
              {selectedTeam.length > 0 && (
                <button
                  onClick={() => setCurrentTab('chemistry')}
                  className="text-sm bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Analyze Chemistry
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {renderCurrentTab()}
        </div>
      </main>
      
      {/* Floating Action Buttons for Quick Access */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-50">
        {/* Team Builder Quick Access */}
        {selectedTeam.length > 0 && currentTab !== 'team' && (
          <button
            onClick={() => setCurrentTab('team')}
            className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105"
            title={`View Team (${selectedTeam.length} members)`}
          >
            <div className="relative">
              🚀
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {selectedTeam.length}
              </span>
            </div>
          </button>
        )}
        
        {/* Compare Quick Access */}
        {compareList.length > 0 && currentTab !== 'compare' && (
          <button
            onClick={() => setCurrentTab('compare')}
            className="bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-all transform hover:scale-105"
            title={`Compare Candidates (${compareList.length})`}
          >
            <div className="relative">
              ⚖️
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {compareList.length}
              </span>
            </div>
          </button>
        )}
        
        {/* Chemistry Analysis Quick Access */}
        {selectedTeam.length >= 2 && currentTab !== 'chemistry' && (
          <button
            onClick={() => setCurrentTab('chemistry')}
            className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-all transform hover:scale-105"
            title="Analyze Team Chemistry"
          >
            🧪
          </button>
        )}
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">H</span>
            </div>
            <span className="text-xl font-bold text-gray-800">HiringSight</span>
          </div>
          <p className="text-gray-600 mb-4">
            AI-Powered Hiring Intelligence Platform • Built with ❤️ for smarter hiring decisions
          </p>
          
          {/* Quick Stats in Footer */}
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500 mb-4">
            <div>📊 {overview?.total_candidates?.toLocaleString()} Candidates</div>
            <div>🌍 {overview?.countries} Countries</div>
            <div>🚀 {selectedTeam.length} Team Members</div>
            <div>⚖️ {compareList.length} In Comparison</div>
          </div>
          
          <div className="text-sm text-gray-500">
            © 2024 HiringSight. Transforming talent acquisition with AI-driven insights.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;