import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Award, Globe, Zap, TrendingUp, DollarSign } from 'lucide-react';
import axios from 'axios';

const StatCard = ({ icon, title, value, subtitle, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500'
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className={`w-12 h-12 ${colorClasses[color]} rounded-xl flex items-center justify-center text-white mb-4`}>
            {icon}
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          <p className="text-gray-500 text-sm">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

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

  // Skills data - fixed to show actual data
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

  // Geographic data - to match your pie chart
  const geographicData = overview?.geographic_distribution
    ? Object.entries(overview.geographic_distribution).map(([continent, count]) => ({
        continent,
        count,
        percentage: (count / overview.total_candidates * 100).toFixed(1)
      }))
    : [
        { continent: 'Asia', count: 287, percentage: '29.4' },
        { continent: 'North America', count: 324, percentage: '33.2' },
        { continent: 'Europe', count: 198, percentage: '20.3' },
        { continent: 'Other', count: 166, percentage: '17.1' }
      ];

  return (
    <div className="space-y-8 bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="text-center py-12 bg-white">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Your Hiring Intelligence Dashboard
        </h1>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto">
          Discover top talent across {overview?.countries || 415} countries with AI-powered insights and data-driven recommendations.
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-6">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          title="Total Candidates"
          value={overview?.total_candidates?.toLocaleString() || '975'}
          subtitle="Global talent pool"
          color="blue"
        />
        <StatCard
          icon={<Award className="w-6 h-6" />}
          title="Avg Quality Score"
          value={overview?.average_score?.toFixed(1) || '68.2'}
          subtitle="Out of 100"
          color="green"
        />
        <StatCard
          icon={<Globe className="w-6 h-6" />}
          title="Countries"
          value={overview?.countries || '415'}
          subtitle="Global reach"
          color="purple"
        />
        <StatCard
          icon={<Zap className="w-6 h-6" />}
          title="High-Value Candidates"
          value={overview?.high_value_candidates || '162'}
          subtitle="Score 80+, Salary <$100k"
          color="yellow"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-6">
        {/* Top Skills in Demand - Bar Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <span className="text-2xl">🔥</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Top Skills in Demand</h3>
              <p className="text-sm text-gray-500">Most requested skills across all candidates</p>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={skillData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="skill" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value) => [value, 'Candidates']}
                labelFormatter={(label) => `Skill: ${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="count" 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]}
                stroke="#2563EB"
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
          
          {/* Skills Summary */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-xl text-center border border-blue-100">
              <div className="text-2xl font-bold text-blue-600">{skillData.length}</div>
              <div className="text-sm text-blue-600 font-medium">Skills Tracked</div>
            </div>
            <div className="bg-green-50 p-4 rounded-xl text-center border border-green-100">
              <div className="text-2xl font-bold text-green-600">
                {skillData.reduce((sum, skill) => sum + skill.count, 0)}
              </div>
              <div className="text-sm text-green-600 font-medium">Total Mentions</div>
            </div>
          </div>
        </div>

        {/* Geographic Distribution - Pie Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <Globe className="w-6 h-6 text-purple-600" />
            <div>
              <h3 className="text-xl font-bold text-gray-900">Geographic Distribution</h3>
              <p className="text-sm text-gray-500">Candidate distribution by region</p>
            </div>
          </div>
          
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
                labelLine={false}
              >
                {geographicData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [value, 'Candidates']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Geographic Summary */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            {geographicData.slice(0, 4).map((region, index) => (
              <div key={region.continent} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-sm text-gray-600">{region.continent}</span>
                <span className="text-sm font-medium text-gray-900">{region.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mx-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-4">Ready to Build Your Dream Team?</h3>
        <p className="text-blue-100 mb-6 text-lg">
          Use our AI-powered tools to discover top talent, analyze market trends, and build diverse, high-performing teams.
        </p>
        <div className="flex flex-wrap gap-4">
          <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
            🔍 Explore Candidates
          </button>
          <button className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-400 transition-colors border border-blue-400">
            🚀 Build Team
          </button>
          <button className="bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-400 transition-colors border border-purple-400">
            🧠 View AI Insights
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;