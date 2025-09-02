import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Brain, TrendingUp, DollarSign, Users, Globe, Target, 
  Zap, Award, AlertTriangle, ChevronDown, ChevronUp,
  BarChart3, PieChart, Map, Clock, Star, Filter
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';


const safeValue = (value, defaultValue = 'N/A') => {
  if (value === null || value === undefined || value === '' || 
      (typeof value === 'number' && (isNaN(value) || !isFinite(value)))) {
    return defaultValue;
  }
  return value;
};

const InsightsPanel = ({ apiBase }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('executive');

  const fetchInsights = async () => {
  try {
    setLoading(true);
    setError(null);

    // Try to load comprehensive insights from the JSON file first
    try {
      const response = await fetch('/comprehensive_hiring_insights.json');
      if (response.ok) {
        const comprehensiveInsights = await response.json();
        console.log('Loaded insights from JSON:', comprehensiveInsights);
        setInsights(comprehensiveInsights);
        setLoading(false);
        return;
      }
    } catch (jsonError) {
      console.log('JSON file not accessible, trying API...');
    }

    // Fallback to API
    const apiResponse = await axios.get(`${apiBase}/api/v1/insights/comprehensive`);
    console.log('Loaded insights from API:', apiResponse.data);
    setInsights(apiResponse.data);
    setLoading(false);
    
  } catch (error) {
    console.error('Error fetching insights:', error);
    setError('Failed to load insights. Please try again.');
    setLoading(false);
  }
};


  useEffect(() => {
    fetchInsights();
  }, [apiBase]);

  if (loading) return <LoadingSpinner />;
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Insights</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={fetchInsights}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="text-center py-12">
        <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No insights available</p>
      </div>
    );
  }

  const tabs = [
    { id: 'executive', label: '📊 Executive Summary', icon: Brain },
    { id: 'market', label: '🌍 Market Intelligence', icon: Globe },
    { id: 'teams', label: '👥 Team Optimization', icon: Users },
    { id: 'skills', label: '🔥 Skill Analysis', icon: Zap },
    { id: 'geography', label: '📍 Geographic Insights', icon: Map },
    { id: 'budget', label: '💰 Budget Strategy', icon: DollarSign },
    { id: 'risks', label: '⚠️ Risk Assessment', icon: AlertTriangle }
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="text-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white">
        <h2 className="text-4xl font-bold mb-4">🧠 AI-Powered Hiring Intelligence</h2>
        <p className="text-xl opacity-90">
          Comprehensive analysis of {insights?.executive_summary?.total_candidates_analyzed?.toLocaleString() || 'N/A'} candidates
        </p>
        {insights?.timestamp && (
          <p className="text-sm opacity-75 mt-2">
            Last updated: {new Date(insights.timestamp).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex flex-wrap border-b">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'executive' && <ExecutiveSummaryTab insights={insights} />}
              {activeTab === 'market' && <MarketIntelligenceTab insights={insights} />}
              {activeTab === 'teams' && <TeamOptimizationTab insights={insights} />}
              {activeTab === 'skills' && <SkillAnalysisTab insights={insights} />}
              {activeTab === 'geography' && <GeographicInsightsTab insights={insights} />}
              {activeTab === 'budget' && <BudgetStrategyTab insights={insights} />}
              {activeTab === 'risks' && <RiskAssessmentTab insights={insights} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// Executive Summary Tab Component
const ExecutiveSummaryTab = ({ insights }) => {
  const executive = insights?.executive_summary || {};
  
  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={<Users className="w-8 h-8" />}
          title="Total Talent Pool"
          value={executive.total_candidates_analyzed?.toLocaleString() || 'N/A'}
          subtitle="Candidates analyzed"
          color="blue"
        />
        <MetricCard
          icon={<Star className="w-8 h-8" />}
          title="High-Value Opportunities"
          value={executive.high_value_opportunities || 'N/A'}
          subtitle="Top candidates (Score 80+)"
          color="gold"
        />
        <MetricCard
          icon={<Globe className="w-8 h-8" />}
          title="Global Reach"
          value={executive.global_talent_reach || 'N/A'}
          subtitle="Countries represented"
          color="green"
        />
        <MetricCard
          icon={<Award className="w-8 h-8" />}
          title="Market Opportunity"
          value={`${executive.market_opportunity_score || 0}%`}
          subtitle="High-value candidate ratio"
          color="purple"
        />
      </div>

      {/* Key Recommendation */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-green-800 mb-2 flex items-center">
          <Target className="w-6 h-6 mr-2" />
          Strategic Recommendation
        </h3>
        <p className="text-green-700 text-lg">
          {executive.key_recommendation || 'Focus on geographic arbitrage and full-stack capabilities'}
        </p>
        {executive.immediate_action_required && (
          <div className="mt-4 flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Immediate action required</span>
          </div>
        )}
      </div>

      {/* Immediate Actions */}
      {insights?.actionable_recommendations?.immediate_actions && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Zap className="w-6 h-6 mr-2 text-orange-600" />
            Immediate Action Items
          </h3>
          <div className="space-y-4">
            {insights.actionable_recommendations.immediate_actions.map((action, index) => (
              <ActionItem key={index} action={action} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Market Intelligence Tab Component
const MarketIntelligenceTab = ({ insights }) => {
  const market = insights?.market_intelligence || {};
  const skillPremiums = market?.skill_premium_analysis || {};
  const geoArbitrage = market?.geographic_arbitrage_opportunities || {};

  return (
    <div className="space-y-6">
      {/* Top Skill Premiums */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
          Top Skill Premiums
        </h3>
        {Object.keys(skillPremiums).length > 0 ? (
          <div className="grid gap-4">
            {Object.entries(skillPremiums).slice(0, 8).map(([skill, data]) => (
              <div key={skill} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-semibold">{skill}</div>
                  <div className="text-sm text-gray-600">{safeValue(data.candidate_count, 0)} candidates</div>
                </div>
                <div className="text-right">
                  <div className="text-green-600 font-bold">
                    +{safeValue(data.premium_percentage?.toFixed(1), '0')}%
                  </div>
                  <div className="text-sm text-gray-600">
                    ${Math.round(safeValue(data.salary_with_skill, 0)).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            No skill premium data available
          </div>
        )}
      </div>

      {/* Geographic Arbitrage */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Map className="w-6 h-6 mr-2 text-blue-600" />
          Geographic Arbitrage Opportunities
        </h3>
        {Object.keys(geoArbitrage).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(geoArbitrage).slice(0, 9).map(([country, data]) => {
              // Handle different data structures
              const avgScore = safeValue(data.avg_score || data.overall_score, 0);
              const avgSalary = safeValue(data.avg_salary || data.salary_full_time, 0);
              const candidateCount = safeValue(data.candidate_count || data.name, 0);
              
              return (
                <div key={country} className="p-4 border border-gray-200 rounded-lg">
                  <div className="font-semibold text-gray-800">{country}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Quality: {typeof avgScore === 'number' ? avgScore.toFixed(1) : avgScore}/100
                  </div>
                  <div className="text-sm text-gray-600">
                    Avg Salary: ${Math.round(avgSalary).toLocaleString()}
                  </div>
                  <div className="text-xs text-blue-600 mt-2">
                    {candidateCount} candidates
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            No geographic arbitrage data available
          </div>
        )}
      </div>
    </div>
  );
};

// Team Optimization Tab Component  
const TeamOptimizationTab = ({ insights }) => {
  const teamTemplates = insights?.team_composition?.team_templates || {};
  const skillComplementarity = insights?.team_composition?.skill_complementarity || {};

  return (
    <div className="space-y-6">
      {/* Team Templates */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Users className="w-6 h-6 mr-2 text-purple-600" />
          Optimal Team Templates
        </h3>
        {Object.keys(teamTemplates).length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(teamTemplates).map(([template, data]) => (
              <TeamTemplateCard key={template} template={template} data={data} />
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            No team template data available
          </div>
        )}
      </div>

      {/* Best Skill Combinations */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Zap className="w-6 h-6 mr-2 text-orange-600" />
          High-Value Skill Combinations
        </h3>
        {Object.keys(skillComplementarity).length > 0 ? (
          <div className="grid gap-3">
            {Object.entries(skillComplementarity).slice(0, 10).map(([combo, data]) => (
              <div key={combo} className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                <div>
                  <div className="font-semibold text-gray-800">{combo}</div>
                  <div className="text-sm text-gray-600">
                    {data.frequency} candidates • {data.geographic_spread} countries
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-orange-600 font-bold">{data.avg_score?.toFixed(1) || 'N/A'}/100</div>
                  <div className="text-sm text-gray-600">Value: {data.value_rating?.toFixed(2) || 'N/A'}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            No skill combination data available
          </div>
        )}
      </div>
    </div>
  );
};

// Skill Analysis Tab Component
const SkillAnalysisTab = ({ insights }) => {
  const talentScarcity = insights?.hiring_strategy?.talent_scarcity || {};
  const marketSaturation = insights?.market_intelligence?.market_saturation || {};

  return (
    <div className="space-y-6">
      {/* Talent Scarcity Analysis */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <AlertTriangle className="w-6 h-6 mr-2 text-red-600" />
          Talent Scarcity Analysis
        </h3>
        {Object.keys(talentScarcity).length > 0 ? (
          <div className="grid gap-3">
            {Object.entries(talentScarcity).slice(0, 12).map(([skill, data]) => (
              <div key={skill} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <div className="font-semibold text-gray-800">{skill}</div>
                  <div className="text-sm text-gray-600">
                    {data.total_candidates} total • {data.quality_candidates} quality
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-red-600 font-bold">
                    Scarcity: {data.scarcity_score?.toFixed(2) || 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            No talent scarcity data available
          </div>
        )}
      </div>

      {/* Market Saturation */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
          Market Saturation Levels
        </h3>
        {Object.keys(marketSaturation).length > 0 ? (
          <div className="grid gap-3">
            {Object.entries(marketSaturation).slice(0, 10).map(([combo, data]) => (
              <div key={combo} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <div className="font-semibold text-gray-800">{combo}</div>
                  <div className="text-sm text-gray-600">{data.candidate_count} candidates</div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${
                    data.saturation_level === 'high' ? 'text-red-600' : 
                    data.saturation_level === 'medium' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {data.saturation_level?.toUpperCase() || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Score: {data.avg_score?.toFixed(1) || 'N/A'}/100</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            No market saturation data available
          </div>
        )}
      </div>
    </div>
  );
};

// Geographic Insights Tab Component
const GeographicInsightsTab = ({ insights }) => {
  const geoData = insights?.dataset_overview?.geographic_coverage || {};

  return (
    <div className="space-y-6">
      {/* Geographic Coverage */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Globe className="w-6 h-6 mr-2 text-green-600" />
          Global Talent Distribution
        </h3>
        {geoData.top_5_countries && Object.keys(geoData.top_5_countries).length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(geoData.top_5_countries).map(([country, count]) => (
              <div key={country} className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">{count}</div>
                <div className="text-sm text-gray-600">{country}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            No geographic distribution data available
          </div>
        )}
      </div>

      {/* Timezone Coverage */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Clock className="w-6 h-6 mr-2 text-blue-600" />
          Timezone Coverage
        </h3>
        {geoData.timezone_coverage && Object.keys(geoData.timezone_coverage).length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(geoData.timezone_coverage).map(([timezone, count]) => (
              <div key={timezone} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="font-semibold text-blue-800">{timezone}</div>
                <div className="text-2xl font-bold text-blue-600">{count}</div>
                <div className="text-sm text-gray-600">candidates</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            No timezone coverage data available
          </div>
        )}
      </div>
    </div>
  );
};

// Budget Strategy Tab Component
const BudgetStrategyTab = ({ insights }) => {
  const budgetStrategies = insights?.budget_optimization?.budget_strategies || {};
  const costEfficiency = insights?.budget_optimization?.cost_efficiency || {};

  return (
    <div className="space-y-6">
      {/* Budget Scenarios */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <DollarSign className="w-6 h-6 mr-2 text-green-600" />
          Budget Optimization Scenarios
        </h3>
        {Object.keys(budgetStrategies).length > 0 ? (
          <div className="grid gap-4">
            {Object.entries(budgetStrategies).map(([budget, strategy]) => (
              <div key={budget} className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-xl font-bold text-green-800">{budget} Budget</div>
                    <div className="text-sm text-gray-600">
                      {safeValue(strategy.team_size, 0)} team members • Avg Score: {safeValue(strategy.avg_score?.toFixed(1), 'N/A')}/100
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-600 font-bold">
                      ${safeValue(strategy.remaining_budget?.toLocaleString(), '0')} saved
                    </div>
                    <div className="text-sm text-gray-600">{safeValue(strategy.countries_represented, 0)} countries</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Skills covered: {safeValue(strategy.skills_covered, 0)} • Total cost: ${safeValue(strategy.total_cost?.toLocaleString(), '0')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            No budget strategy data available
          </div>
        )}
      </div>

      {/* Top Value Candidates */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Star className="w-6 h-6 mr-2 text-yellow-600" />
          Top Value Candidates
        </h3>
        {costEfficiency.top_value_candidates && costEfficiency.top_value_candidates.length > 0 ? (
          <div className="grid gap-3">
            {costEfficiency.top_value_candidates.slice(0, 8).map((candidate, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div>
                  <div className="font-semibold text-gray-800">{safeValue(candidate.name, 'Anonymous')}</div>
                  <div className="text-sm text-gray-600">{safeValue(candidate.country, 'Unknown')}</div>
                </div>
                <div className="text-right">
                  <div className="text-yellow-600 font-bold">
                    {safeValue(candidate.overall_score?.toFixed(1), '0')}/100
                  </div>
                  <div className="text-sm text-gray-600">
                    ${safeValue(candidate.salary_full_time?.toLocaleString(), '0')}
                  </div>
                  <div className="text-xs text-yellow-600">
                    Value: {safeValue(candidate.value_score?.toFixed(2), '0')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            No value candidate data available
          </div>
        )}
      </div>
    </div>
  );
};

// Risk Assessment Tab Component
const RiskAssessmentTab = ({ insights }) => {
  const risks = insights?.risk_mitigation || {};
  const skillShortages = risks?.skill_shortage_risks || {};

  return (
    <div className="space-y-6">
      {/* Skill Shortage Risks */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <AlertTriangle className="w-6 h-6 mr-2 text-red-600" />
          Skill Shortage Risks
        </h3>
        {Object.keys(skillShortages).length > 0 ? (
          <div className="grid gap-3">
            {Object.entries(skillShortages).map(([category, data]) => (
              <div key={category} className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-red-800">
                      {category.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-600">{data.total_candidates} candidates available</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    data.risk_level === 'high' ? 'bg-red-100 text-red-700' :
                    data.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {data.risk_level?.toUpperCase() || 'UNKNOWN'} RISK
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            No skill shortage data available
          </div>
        )}
      </div>

      {/* Geographic Concentration Risk */}
      {risks?.geographic_concentration && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Map className="w-6 h-6 mr-2 text-orange-600" />
            Geographic Concentration Risk
          </h3>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex justify-between items-center mb-3">
              <div className="font-semibold text-orange-800">Concentration Level</div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                risks.geographic_concentration.risk_level === 'high' ? 'bg-red-100 text-red-700' :
                risks.geographic_concentration.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {risks.geographic_concentration.risk_level?.toUpperCase() || 'UNKNOWN'} RISK
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Concentration Ratio: {((risks.geographic_concentration.concentration_ratio || 0) * 100).toFixed(1)}%
            </div>
            {risks.geographic_concentration.top_countries && (
              <div className="mt-3 grid grid-cols-3 gap-4">
                {Object.entries(risks.geographic_concentration.top_countries).map(([country, count]) => (
                  <div key={country} className="text-center">
                    <div className="font-bold text-orange-600">{count}</div>
                    <div className="text-xs text-gray-600">{country}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
const MetricCard = ({ icon, title, value, subtitle, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 text-blue-600',
    gold: 'from-yellow-500 to-yellow-600 text-yellow-600',
    green: 'from-green-500 to-green-600 text-green-600',
    purple: 'from-purple-500 to-purple-600 text-purple-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]} text-white mb-4`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-lg font-semibold text-gray-700 mb-1">{title}</div>
      <div className="text-sm text-gray-500">{subtitle}</div>
    </div>
  );
};

const ActionItem = ({ action }) => {
  const priorityColors = {
    HIGH: 'border-red-200 bg-red-50 text-red-700',
    MEDIUM: 'border-yellow-200 bg-yellow-50 text-yellow-700',
    LOW: 'border-green-200 bg-green-50 text-green-700'
  };

  return (
    <div className="border-l-4 border-blue-500 pl-4 py-3">
      <div className="flex items-center gap-3 mb-2">
        <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[action.priority] || priorityColors.MEDIUM}`}>
          {action.priority || 'MEDIUM'}
        </span>
        <span className="text-sm text-gray-600">{action.timeline || 'TBD'}</span>
      </div>
      <h4 className="font-semibold text-gray-800 mb-1">{action.action || 'Action Item'}</h4>
      <p className="text-gray-600 text-sm">{action.description || 'No description available'}</p>
      {action.candidates && (
        <div className="mt-2 text-xs text-blue-600">
          {action.candidates.length} candidates identified
        </div>
      )}
    </div>
  );
};

const TeamTemplateCard = ({ template, data }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold text-gray-800 capitalize">{template.replace('_', ' ')}</h4>
          <p className="text-sm text-gray-600 mt-1">{data.description || 'No description available'}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-purple-600">{data.ideal_size || 'N/A'}</div>
          <div className="text-xs text-gray-500">members</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <div className="text-sm text-gray-500">Avg Score</div>
          <div className="font-semibold text-purple-600">
            {data.avg_score ? data.avg_score.toFixed(1) : 'N/A'}/100
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Avg Salary</div>
          <div className="font-semibold text-green-600">
            ${Math.round(data.avg_salary || 0).toLocaleString()}
          </div>
        </div>
      </div>

      {data.key_traits && (
        <div className="flex flex-wrap gap-1 mb-3">
          {data.key_traits.map((trait, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              {trait}
            </span>
          ))}
        </div>
      )}

      {data.top_candidates && data.top_candidates.length > 0 && (
        <div>
          <div className="text-xs text-gray-500 mb-1">Top Candidates:</div>
          <div className="space-y-1">
            {data.top_candidates.slice(0, 3).map((candidate, index) => (
              <div key={index} className="text-xs flex justify-between">
                <span className="text-gray-700">{candidate.name || 'Anonymous'}</span>
                <span className="text-purple-600">
                  {candidate.overall_score ? candidate.overall_score.toFixed(1) : 'N/A'}/100
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightsPanel;