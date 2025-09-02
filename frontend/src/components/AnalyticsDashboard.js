import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ResponsiveContainer, 
  ScatterChart,
  Scatter,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { TrendingUp, BarChart3, DollarSign, Users, Activity } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const AnalyticsDashboard = ({ apiBase }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch candidates for salary vs score analysis
      const candidatesResponse = await axios.get(`${apiBase}/api/v1/candidates?limit=200`);
      const candidatesData = candidatesResponse.data.candidates || [];
      setCandidates(candidatesData);

      // Fetch market data for skills analysis
      const marketResponse = await axios.get(`${apiBase}/api/v1/analytics/market`);
      setMarketData(marketResponse.data);

      // Process data for analytics
      const processedData = processAnalyticsData(candidatesData, marketResponse.data);
      setAnalyticsData(processedData);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setLoading(false);
    }
  };

  const processAnalyticsData = (candidatesData, marketData) => {
    // Process salary vs score data
    const salaryScoreData = candidatesData
      .filter(candidate => 
        candidate.salary_full_time && 
        candidate.salary_full_time > 0 && 
        candidate.overall_score > 0
      )
      .map(candidate => ({
        overall_score: candidate.overall_score,
        salary_full_time: candidate.salary_full_time,
        name: candidate.name,
        country: candidate.country,
        primary_skill_category: candidate.primary_skill_category
      }));

    // Process skills demand data
    const skillsDemand = marketData?.high_demand_skills ? 
      Object.entries(marketData.high_demand_skills)
        .slice(0, 15)
        .map(([skill, count]) => ({
          skill: skill.length > 12 ? skill.substring(0, 12) + '...' : skill,
          fullSkill: skill,
          demand: count,
          intensity: Math.min(count / 50, 1) // Normalize to 0-1 for color intensity
        })) : [];

    return {
      salary_score_data: salaryScoreData,
      skills_demand: skillsDemand,
      total_candidates: candidatesData.length,
      candidates_with_salary: salaryScoreData.length
    };
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">📊 Advanced Analytics Dashboard</h2>
        <p className="text-gray-600">Deep insights into salary trends, skill demands, and market dynamics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {analyticsData?.candidates_with_salary || 0}
              </div>
              <div className="text-sm text-gray-600">Candidates with Salary Data</div>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {analyticsData?.skills_demand?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Skills Tracked</div>
            </div>
            <BarChart3 className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">
                ${analyticsData?.salary_score_data?.length > 0 ? 
                  Math.round(analyticsData.salary_score_data.reduce((sum, c) => sum + c.salary_full_time, 0) / analyticsData.salary_score_data.length).toLocaleString() : 
                  '0'}
              </div>
              <div className="text-sm text-gray-600">Average Salary</div>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {analyticsData?.salary_score_data?.length > 0 ? 
                  (analyticsData.salary_score_data.reduce((sum, c) => sum + c.overall_score, 0) / analyticsData.salary_score_data.length).toFixed(1) : 
                  '0'}
              </div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
            <Activity className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Salary vs Score Analysis */}
      <SalaryScoreChart data={analyticsData?.salary_score_data || []} />

      {/* Skills Demand Heatmap */}
      <SkillsDemandChart data={analyticsData?.skills_demand || []} />
      
      {/* Market Insights */}
      <MarketInsightsSection marketData={marketData} />
    </div>
  );
};

// Salary vs Score Analysis Component
const SalaryScoreChart = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-blue-600">Score: {data.overall_score}/100</p>
          <p className="text-green-600">Salary: ${data.salary_full_time?.toLocaleString()}</p>
          <p className="text-gray-600">Country: {data.country}</p>
          <p className="text-purple-600">Category: {data.primary_skill_category}</p>
        </div>
      );
    }
    return null;
  };

  const COLORS = {
    'frontend': '#3B82F6',
    'backend': '#10B981', 
    'data': '#8B5CF6',
    'mobile': '#F59E0B',
    'cloud': '#EF4444',
    'database': '#6B7280',
    'devops': '#84CC16',
    'languages': '#EC4899'
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold mb-4 flex items-center">
        <DollarSign className="w-6 h-6 mr-2 text-green-600" />
        💰 Salary vs Quality Score Analysis
      </h3>
      <div className="mb-4 text-sm text-gray-600">
        Analyzing {data.length} candidates with salary information. Look for candidates in the top-right quadrant (high score, reasonable salary).
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number" 
            dataKey="overall_score" 
            name="Overall Score"
            domain={[0, 100]}
            label={{ value: 'Quality Score (0-100)', position: 'insideBottom', offset: -10 }}
          />
          <YAxis 
            type="number" 
            dataKey="salary_full_time" 
            name="Salary"
            label={{ value: 'Annual Salary ($)', angle: -90, position: 'insideLeft' }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* Group by skill category for different colors */}
          {Object.entries(COLORS).map(([category, color]) => {
            const categoryData = data.filter(d => d.primary_skill_category === category);
            return categoryData.length > 0 ? (
              <Scatter 
                key={category}
                name={category.charAt(0).toUpperCase() + category.slice(1)}
                data={categoryData} 
                fill={color}
                fillOpacity={0.7}
              />
            ) : null;
          })}
          
          {/* Fallback for uncategorized data */}
          <Scatter 
            name="Other"
            data={data.filter(d => !Object.keys(COLORS).includes(d.primary_skill_category))} 
            fill="#94A3B8"
            fillOpacity={0.7}
          />
        </ScatterChart>
      </ResponsiveContainer>

      {/* Insights */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-green-800 font-semibold">High Value Zone</div>
          <div className="text-sm text-green-600">
            {data.filter(d => d.overall_score >= 80 && d.salary_full_time <= 80000).length} candidates
          </div>
          <div className="text-xs text-green-500">Score 80+, Salary ≤$80k</div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-blue-800 font-semibold">Premium Candidates</div>
          <div className="text-sm text-blue-600">
            {data.filter(d => d.overall_score >= 90).length} candidates
          </div>
          <div className="text-xs text-blue-500">Score 90+</div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-purple-800 font-semibold">Budget Friendly</div>
          <div className="text-sm text-purple-600">
            {data.filter(d => d.salary_full_time <= 70000).length} candidates
          </div>
          <div className="text-xs text-purple-500">Salary ≤$70k</div>
        </div>
      </div>
    </div>
  );
};

// Skills Demand Heatmap Component
const SkillsDemandChart = ({ data }) => {
  const getHeatmapColor = (intensity) => {
    if (intensity >= 0.8) return 'bg-red-500';
    if (intensity >= 0.6) return 'bg-orange-500';
    if (intensity >= 0.4) return 'bg-yellow-500';
    if (intensity >= 0.2) return 'bg-blue-500';
    return 'bg-gray-400';
  };

  const getTextColor = (intensity) => {
    return intensity >= 0.4 ? 'text-white' : 'text-gray-800';
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold mb-4 flex items-center">
        <BarChart3 className="w-6 h-6 mr-2 text-orange-600" />
        🔥 Skills Demand Heatmap
      </h3>
      <div className="mb-4 text-sm text-gray-600">
        Visual representation of skill demand intensity. Darker colors indicate higher demand.
      </div>
      
      {/* Heatmap Grid */}
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 mb-6">
        {data.map((skill, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg transition-all duration-200 hover:scale-105 cursor-pointer ${getHeatmapColor(skill.intensity)} ${getTextColor(skill.intensity)}`}
            title={`${skill.fullSkill}: ${skill.demand} candidates`}
          >
            <div className="text-center">
              <div className="font-semibold text-sm mb-1">{skill.skill}</div>
              <div className="text-xs">{skill.demand}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-400 rounded"></div>
          <span>Low (0-50)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Medium (50-100)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>High (100-150)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <span>Very High (150-200)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Extreme (200+)</span>
        </div>
      </div>

      {/* Top Skills Bar Chart */}
      <div className="mt-6">
        <h4 className="text-lg font-semibold mb-3">Top 10 Most Demanded Skills</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
              formatter={(value, name) => [value, 'Candidates']}
              labelFormatter={(label) => `Skill: ${data.find(d => d.skill === label)?.fullSkill || label}`}
            />
            <Bar dataKey="demand" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Market Insights Section
const MarketInsightsSection = ({ marketData }) => {
  if (!marketData) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Country Statistics */}
      {marketData.country_statistics && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Users className="w-6 h-6 mr-2 text-blue-600" />
            Top Countries by Value
          </h3>
          <div className="space-y-3">
            {Object.entries(marketData.country_statistics)
              .sort(([,a], [,b]) => (b.avg_score / (b.avg_salary / 1000)) - (a.avg_score / (a.avg_salary / 1000)))
              .slice(0, 8)
              .map(([country, stats]) => (
                <div key={country} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-semibold">{country}</div>
                    <div className="text-sm text-gray-600">{stats.candidate_count} candidates</div>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-600 font-bold">{stats.avg_score.toFixed(1)}/100</div>
                    <div className="text-sm text-gray-600">${Math.round(stats.avg_salary).toLocaleString()}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Experience Distribution */}
      {marketData.experience_distribution && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
            Experience Level Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={Object.entries(marketData.experience_distribution).map(([level, count]) => ({ level, count }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;