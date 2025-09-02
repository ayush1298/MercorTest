import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, X } from 'lucide-react';

const FilterPanel = ({ filters, setFilters, apiBase }) => {
  const [filterOptions, setFilterOptions] = useState({
    countries: [],
    skill_categories: [],
    experience_levels: [],
    salary_ranges: [],
    score_ranges: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get(`${apiBase}/api/v1/filters/options`);
      setFilterOptions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching filter options:', error);
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
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
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold text-gray-800">Advanced Filters</h4>
        <button
          onClick={clearFilters}
          className="flex items-center gap-2 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
          Clear All
        </button>
      </div>

      {/* Score Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Min Score: {filters.min_score}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={filters.min_score}
            onChange={(e) => updateFilter('min_score', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>100</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Score: {filters.max_score}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={filters.max_score}
            onChange={(e) => updateFilter('max_score', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>100</span>
          </div>
        </div>
      </div>

      {/* Salary Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Min Salary: ${(filters.min_salary / 1000).toFixed(0)}k
          </label>
          <input
            type="range"
            min="0"
            max="300"
            value={filters.min_salary / 1000}
            onChange={(e) => updateFilter('min_salary', parseInt(e.target.value) * 1000)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>$0k</span>
            <span>$300k</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Salary: ${filters.max_salary === 999999 ? '∞' : (filters.max_salary / 1000).toFixed(0) + 'k'}
          </label>
          <input
            type="range"
            min="0"
            max="300"
            value={filters.max_salary === 999999 ? 300 : filters.max_salary / 1000}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              updateFilter('max_salary', value === 300 ? 999999 : value * 1000);
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>$0k</span>
            <span>No limit</span>
          </div>
        </div>
      </div>

      {/* Dropdown Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Country Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country ({filterOptions.countries?.length || 0} available)
          </label>
          <select
            value={filters.country}
            onChange={(e) => updateFilter('country', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">All Countries</option>
            {filterOptions.countries?.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>
        </div>

        {/* Skill Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skill Category
          </label>
          <select
            value={filters.skill_category}
            onChange={(e) => updateFilter('skill_category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">All Categories</option>
            {filterOptions.skill_categories?.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Experience Level Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience Level
          </label>
          <select
            value={filters.experience_level}
            onChange={(e) => updateFilter('experience_level', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">All Levels</option>
            {filterOptions.experience_levels?.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        {/* Big Tech Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Big Tech Experience
          </label>
          <select
            value={filters.has_big_tech === null ? '' : filters.has_big_tech.toString()}
            onChange={(e) => {
              const value = e.target.value;
              updateFilter('has_big_tech', value === '' ? null : value === 'true');
            }}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">All Candidates</option>
            <option value="true">Big Tech Experience</option>
            <option value="false">No Big Tech Experience</option>
          </select>
        </div>
      </div>

      {/* Search Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search in Skills, Name, Location
        </label>
        <input
          type="text"
          value={filters.search || ''}
          onChange={(e) => updateFilter('search', e.target.value)}
          placeholder="e.g., React, Python, Machine Learning..."
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filter Summary */}
      {(filters.country || filters.skill_category || filters.experience_level || 
        filters.has_big_tech !== null || filters.search || 
        filters.min_score > 0 || filters.max_score < 100 || 
        filters.min_salary > 0 || filters.max_salary < 999999) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="text-sm font-medium text-blue-800 mb-2">Active Filters:</h5>
          <div className="flex flex-wrap gap-2">
            {filters.min_score > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                Score ≥ {filters.min_score}
              </span>
            )}
            {filters.max_score < 100 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                Score ≤ {filters.max_score}
              </span>
            )}
            {filters.country && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                {filters.country}
              </span>
            )}
            {filters.skill_category && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                {filters.skill_category}
              </span>
            )}
            {filters.experience_level && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                {filters.experience_level}
              </span>
            )}
            {filters.has_big_tech === true && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                Big Tech
              </span>
            )}
            {filters.search && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                Search: "{filters.search}"
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;