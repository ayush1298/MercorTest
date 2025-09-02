/* filepath: frontend/src/components/Dashboard.js */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Globe, Zap, DollarSign, Award } from 'lucide-react';
import StatCard from './StatCard';
import LoadingSpinner from './LoadingSpinner';

// Replace the skills data processing section (around line 29)
const Dashboard = ({ overview, apiBase }) => {
  const [loading, setLoading] = useState(false);
  const [marketData, setMarketData] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const marketResponse = await axios.get(`${apiBase}/api/v1/analytics/market`);
      setMarketData(marketResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6B7280'];

  // Replace the skillData processing with this:
  const skillData = marketData?.high_demand_skills 
    ? Object.entries(marketData.high_demand_skills)
        .slice(0, 8)
        .map(([skill, count]) => ({
          skill: skill.length > 12 ? skill.substring(0, 12) + '...' : skill,
          count: count
        }))
    : [
        { skill: 'JavaScript', count: 245 },
        { skill: 'React', count: 189 },
        { skill: 'Python', count: 167 },
        { skill: 'Node.js', count: 134 },
        { skill: 'TypeScript', count: 98 },
        { skill: 'Java', count: 87 },
        { skill: 'AWS', count: 76 },
        { skill: 'SQL', count: 65 }
      ];

  // Keep the geographic data as is
  const geographicData = overview?.geographic_distribution
    ? Object.entries(overview.geographic_distribution).map(([continent, count]) => ({
        continent,
        count,
        percentage: (count / overview.total_candidates * 100).toFixed(1)
      }))
    : [];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to Your Hiring Intelligence Dashboard
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover top talent across {overview?.countries} countries with AI-powered insights and data-driven recommendations.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users className="w-8 h-8" />}
          title="Total Candidates"
          value={overview?.total_candidates?.toLocaleString()}
          subtitle="Global talent pool"
          color="blue"
        />
        <StatCard
          icon={<Award className="w-8 h-8" />}
          title="Avg Quality Score"
          value={overview?.average_score?.toFixed(1)}
          subtitle="Out of 100"
          color="green"
        />
        <StatCard
          icon={<Globe className="w-8 h-8" />}
          title="Countries"
          value={overview?.countries}
          subtitle="Global reach"
          color="purple"
        />
        <StatCard
          icon={<Zap className="w-8 h-8" />}
          title="High-Value Candidates"
          value={overview?.high_value_candidates}
          subtitle="Score 80+, Salary <$100k"
          color="yellow"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Skills Distribution - Updated */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
            🔥 Top Skills in Demand
          </h3>
          <div className="mb-4 text-sm text-gray-600">
            Most requested skills across all candidates
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={skillData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="skill" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [value, 'Candidates']}
                labelFormatter={(label) => `Skill: ${label}`}
              />
              <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          
          {/* Skills Summary */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-blue-600">{skillData.length}</div>
              <div className="text-xs text-blue-600">Skills Tracked</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-green-600">
                {skillData.reduce((sum, skill) => sum + skill.count, 0)}
              </div>
              <div className="text-xs text-green-600">Total Mentions</div>
            </div>
          </div>
        </div>

        {/* Geographic Distribution - Keep as is */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Globe className="w-6 h-6 mr-2 text-purple-600" />
            Geographic Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={geographicData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                label={({ continent, percentage }) => `${continent} ${percentage}%`}
              >
                {geographicData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rest of your dashboard components remain the same */}
      {marketData?.salary_ranges && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <DollarSign className="w-6 h-6 mr-2 text-green-600" />
            Salary Intelligence
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(marketData.salary_ranges).map(([key, value]) => (
              <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-800">
                  ${Math.round(value).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 capitalize">
                  {key === 'q1' ? '25th Percentile' : 
                   key === 'q3' ? '75th Percentile' : 
                   key.charAt(0).toUpperCase() + key.slice(1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-4">Ready to Build Your Dream Team?</h3>
        <p className="text-blue-100 mb-6">
          Use our AI-powered tools to discover top talent, analyze market trends, and build diverse, high-performing teams.
        </p>
        <div className="flex flex-wrap gap-4">
          <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            🔍 Explore Candidates
          </button>
          <button className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-400 transition-colors">
            🚀 Build Team
          </button>
          <button className="bg-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-400 transition-colors">
            🧠 View AI Insights
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;