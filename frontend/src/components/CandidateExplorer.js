import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Users, TrendingUp, MapPin } from 'lucide-react';
import CandidateCard from './CandidateCard';
import FilterPanel from './FilterPanel';
import LoadingSpinner from './LoadingSpinner';
import { motion } from 'framer-motion';

const CandidateExplorer = ({ selectedTeam, setSelectedTeam, apiBase }) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    min_score: 0,
    max_score: 100,
    min_salary: 0,
    max_salary: 999999,
    country: '',
    skill_category: '',
    experience_level: '',
    has_big_tech: null,
    search: '',
    limit: 50
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchCandidates();
    }, 300); // Debounce API calls

    return () => clearTimeout(debounceTimer);
  }, [filters]);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          params.append(key, value);
        }
      });

      // Add search term to filters
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await axios.get(`${apiBase}/api/v1/candidates?${params}`);
      setCandidates(response.data.candidates || []);
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setCandidates([]);
      setLoading(false);
    }
  };

  const addToTeam = (candidate) => {
    if (selectedTeam.length < 5 && !selectedTeam.find(c => c.id === candidate.id)) {
      setSelectedTeam([...selectedTeam, candidate]);
    }
  };

  const removeFromTeam = (candidateId) => {
    setSelectedTeam(selectedTeam.filter(c => c.id !== candidateId));
  };

  const isSelected = (candidateId) => {
    return selectedTeam.some(c => c.id === candidateId);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setFilters(prev => ({ ...prev, search: value }));
  };

  if (loading && candidates.length === 0) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Candidate Explorer</h2>
          <p className="text-gray-600">Discover and evaluate top talent from around the world</p>
          {stats && (
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {stats.total_filtered} candidates match your criteria
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Showing top {stats.total_returned}
              </span>
            </div>
          )}
        </div>
        
        {/* Selected Team Summary */}
        {selectedTeam.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg px-4 py-3">
            <div className="text-sm font-medium text-blue-800">
              Selected Team: {selectedTeam.length}/5
            </div>
            <div className="text-xs text-blue-600">
              Avg Score: {(selectedTeam.reduce((sum, c) => sum + c.overall_score, 0) / selectedTeam.length).toFixed(1)}
            </div>
            <div className="text-xs text-blue-600">
              Countries: {new Set(selectedTeam.map(c => c.country)).size}
            </div>
          </div>
        )}
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, skills, location, or company..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              showFilters 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-5 h-5" />
            Advanced Filters
            {(filters.country || filters.skill_category || filters.experience_level || 
              filters.has_big_tech !== null || filters.min_score > 0 || 
              filters.max_score < 100) && (
              <span className="bg-red-500 text-white text-xs rounded-full w-2 h-2"></span>
            )}
          </button>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilters({...filters, limit: Math.min(filters.limit + 20, 200)})}
              disabled={loading}
              className="px-4 py-3 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-gray-200"
          >
            <FilterPanel filters={filters} setFilters={setFilters} apiBase={apiBase} />
          </motion.div>
        )}
      </div>

      {/* Results Summary with Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow text-center">
          <div className="text-2xl font-bold text-blue-600">{candidates.length}</div>
          <div className="text-sm text-gray-600">Candidates Shown</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow text-center">
          <div className="text-2xl font-bold text-green-600">
            {candidates.length > 0 ? (candidates.reduce((sum, c) => sum + c.overall_score, 0) / candidates.length).toFixed(1) : 0}
          </div>
          <div className="text-sm text-gray-600">Average Score</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow text-center">
          <div className="text-2xl font-bold text-purple-600">
            {new Set(candidates.map(c => c.country)).size}
          </div>
          <div className="text-sm text-gray-600">Countries</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow text-center">
          <div className="text-2xl font-bold text-orange-600">
            {candidates.filter(c => c.has_big_tech).length}
          </div>
          <div className="text-sm text-gray-600">Big Tech Experience</div>
        </div>
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((candidate, index) => (
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <CandidateCard
              candidate={candidate}
              isSelected={isSelected(candidate.id)}
              onAdd={() => addToTeam(candidate)}
              onRemove={() => removeFromTeam(candidate.id)}
              teamFull={selectedTeam.length >= 5}
            />
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {candidates.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No candidates found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search criteria or filters</p>
          <button
            onClick={() => {
              setFilters({
                min_score: 0,
                max_score: 100,
                min_salary: 0,
                max_salary: 999999,
                country: '',
                skill_category: '',
                experience_level: '',
                has_big_tech: null,
                search: '',
                limit: 50
              });
              setSearchTerm('');
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Loading Indicator for Load More */}
      {loading && candidates.length > 0 && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading more candidates...</p>
        </div>
      )}
    </div>
  );
};

export default CandidateExplorer;