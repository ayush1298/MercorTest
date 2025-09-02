import React, { useState, useEffect } from 'react';
import { Users, Zap, Target, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const TeamChemistry = ({ selectedTeam = [], apiBase, onRemoveFromTeam, onOptimizeTeam }) => {
  const [chemistryAnalysis, setChemistryAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedTeam && selectedTeam.length >= 2) {
      analyzeTeamChemistry();
    } else {
      setChemistryAnalysis(null);
      setError(null);
    }
  }, [selectedTeam]);

  const analyzeTeamChemistry = async () => {
    if (!selectedTeam || selectedTeam.length < 2) {
      setError('Need at least 2 team members for chemistry analysis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API call for team chemistry analysis
      // In a real app, this would call your backend
      const mockAnalysis = generateMockChemistryAnalysis(selectedTeam);
      setChemistryAnalysis(mockAnalysis);
    } catch (err) {
      console.error('Error analyzing team chemistry:', err);
      setError('Failed to analyze team chemistry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateMockChemistryAnalysis = (team) => {
    if (!team || !Array.isArray(team) || team.length === 0) {
      return null;
    }

    // Calculate team chemistry metrics
    const avgScore = team.reduce((sum, member) => sum + (member.overall_score || 0), 0) / team.length;
    const skillDiversity = calculateSkillDiversity(team);
    const experienceBalance = calculateExperienceBalance(team);
    const geographicSpread = calculateGeographicSpread(team);

    return {
      overallChemistry: Math.min(95, Math.round((avgScore + skillDiversity + experienceBalance) / 3)),
      teamSize: team.length,
      strengths: [
        'Strong technical foundation',
        'Diverse skill set',
        'Good experience balance',
        'Global perspective'
      ],
      improvements: [
        'Consider adding senior leadership',
        'Enhance frontend expertise',
        'Add DevOps specialist'
      ],
      skillDistribution: generateSkillDistribution(team),
      collaborationMatrix: generateCollaborationMatrix(team),
      riskFactors: generateRiskFactors(team),
      recommendations: generateRecommendations(team)
    };
  };

  const calculateSkillDiversity = (team) => {
    if (!team || team.length === 0) return 0;
    
    const allSkills = new Set();
    team.forEach(member => {
      if (member.original_skills) {
        try {
          const skills = typeof member.original_skills === 'string' 
            ? JSON.parse(member.original_skills) 
            : member.original_skills;
          if (Array.isArray(skills)) {
            skills.forEach(skill => allSkills.add(skill.toLowerCase()));
          }
        } catch (e) {
          // Handle parsing errors gracefully
        }
      }
    });
    
    return Math.min(100, allSkills.size * 5); // Cap at 100
  };

  const calculateExperienceBalance = (team) => {
    if (!team || team.length === 0) return 0;
    
    const experienceLevels = team.map(member => {
      const level = member.experience_level || 'unknown';
      if (level.toLowerCase().includes('senior')) return 3;
      if (level.toLowerCase().includes('mid')) return 2;
      if (level.toLowerCase().includes('junior')) return 1;
      return 2; // default to mid-level
    });
    
    const avgExperience = experienceLevels.reduce((sum, level) => sum + level, 0) / experienceLevels.length;
    return Math.round(avgExperience * 30); // Scale to 0-90
  };

  const calculateGeographicSpread = (team) => {
    if (!team || team.length === 0) return 0;
    
    const countries = new Set(team.map(member => member.country).filter(Boolean));
    return Math.min(100, countries.size * 25); // Cap at 100
  };

  const generateSkillDistribution = (team) => {
    if (!team || team.length === 0) return [];
    
    const skillCategories = {
      'Frontend': ['react', 'vue', 'angular', 'javascript', 'typescript', 'html', 'css'],
      'Backend': ['node.js', 'python', 'java', 'spring', 'django', 'express'],
      'Database': ['sql', 'mongodb', 'postgresql', 'mysql', 'redis'],
      'Cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes'],
      'DevOps': ['jenkins', 'ci/cd', 'terraform', 'ansible'],
      'Mobile': ['react native', 'flutter', 'ios', 'android', 'swift', 'kotlin']
    };

    const distribution = {};
    
    Object.keys(skillCategories).forEach(category => {
      distribution[category] = 0;
    });

    team.forEach(member => {
      if (member.original_skills) {
        try {
          const skills = typeof member.original_skills === 'string' 
            ? JSON.parse(member.original_skills) 
            : member.original_skills;
          
          if (Array.isArray(skills)) {
            skills.forEach(skill => {
              const lowerSkill = skill.toLowerCase();
              Object.entries(skillCategories).forEach(([category, categorySkills]) => {
                if (categorySkills.some(catSkill => lowerSkill.includes(catSkill))) {
                  distribution[category]++;
                }
              });
            });
          }
        } catch (e) {
          // Handle parsing errors
        }
      }
    });

    return Object.entries(distribution).map(([category, count]) => ({
      category,
      count,
      percentage: team.length > 0 ? Math.round((count / team.length) * 100) : 0
    }));
  };

  const generateCollaborationMatrix = (team) => {
    if (!team || team.length === 0) return [];
    
    return team.map((member, index) => ({
      name: member.name || `Member ${index + 1}`,
      score: member.overall_score || 0,
      compatibility: Math.round(60 + Math.random() * 35), // Mock compatibility score
      timezone: member.timezone_group || 'Unknown',
      communicationStyle: ['Direct', 'Collaborative', 'Analytical', 'Creative'][Math.floor(Math.random() * 4)]
    }));
  };

  const generateRiskFactors = (team) => {
    if (!team || team.length === 0) return [];
    
    const risks = [];
    
    if (team.length < 3) {
      risks.push({
        type: 'Team Size',
        level: 'HIGH',
        description: 'Small team size may lead to knowledge silos and single points of failure.',
        impact: 'High'
      });
    }
    
    const countries = new Set(team.map(member => member.country).filter(Boolean));
    if (countries.size === 1) {
      risks.push({
        type: 'Geographic Concentration',
        level: 'MEDIUM',
        description: 'All team members in same location may limit timezone coverage.',
        impact: 'Medium'
      });
    }

    const juniorMembers = team.filter(member => 
      member.experience_level && member.experience_level.toLowerCase().includes('junior')
    ).length;
    
    if (juniorMembers > team.length * 0.7) {
      risks.push({
        type: 'Experience Imbalance',
        level: 'MEDIUM',
        description: 'High ratio of junior members may require additional mentoring.',
        impact: 'Medium'
      });
    }

    return risks;
  };

  const generateRecommendations = (team) => {
    if (!team || team.length === 0) return [];
    
    return [
      {
        type: 'Skill Enhancement',
        priority: 'HIGH',
        action: 'Consider adding a DevOps specialist to improve deployment processes',
        timeline: '2-4 weeks'
      },
      {
        type: 'Team Dynamics',
        priority: 'MEDIUM',
        action: 'Schedule regular team building activities to improve collaboration',
        timeline: 'Ongoing'
      },
      {
        type: 'Knowledge Sharing',
        priority: 'HIGH',
        action: 'Implement pair programming sessions to share expertise',
        timeline: '1-2 weeks'
      }
    ];
  };

  // Show empty state if no team selected
  if (!selectedTeam || selectedTeam.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-16">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Team Selected</h2>
          <p className="text-gray-600 mb-6">
            Select team members from the Candidates or Team Builder tab to analyze team chemistry.
          </p>
          <button 
            onClick={() => window.location.href = '#candidates'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Candidates
          </button>
        </div>
      </div>
    );
  }

  // Show minimum team size message
  if (selectedTeam.length < 2) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-16">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Need More Team Members</h2>
          <p className="text-gray-600 mb-6">
            Chemistry analysis requires at least 2 team members. You currently have {selectedTeam.length} member(s).
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
            <h3 className="font-semibold text-yellow-800 mb-2">Current Team:</h3>
            {selectedTeam.map((member, index) => (
              <div key={index} className="flex items-center justify-between py-1">
                <span className="text-yellow-700">{member.name}</span>
                <button
                  onClick={() => onRemoveFromTeam && onRemoveFromTeam(member.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Analyzing Team Chemistry...</h2>
          <p className="text-gray-600">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-16">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Analysis Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={analyzeTeamChemistry}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!chemistryAnalysis) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-16">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🧪 Team Chemistry Analysis</h1>
        <p className="text-gray-600">
          Analyzing collaboration potential for {selectedTeam.length} team members
        </p>
      </div>

      {/* Overall Chemistry Score */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mb-4">
            <span className="text-3xl font-bold text-white">
              {chemistryAnalysis.overallChemistry}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Overall Team Chemistry</h2>
          <p className="text-gray-600 mb-4">
            {chemistryAnalysis.overallChemistry >= 80 ? 'Excellent' : 
             chemistryAnalysis.overallChemistry >= 60 ? 'Good' : 'Needs Improvement'} collaboration potential
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{selectedTeam.length}</div>
              <div className="text-sm text-gray-600">Team Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {chemistryAnalysis.skillDistribution?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Skill Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(selectedTeam.map(m => m.country).filter(Boolean)).size}
              </div>
              <div className="text-sm text-gray-600">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(selectedTeam.reduce((sum, m) => sum + (m.overall_score || 0), 0) / selectedTeam.length)}
              </div>
              <div className="text-sm text-gray-600">Avg Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {selectedTeam.map((member, index) => (
          <div key={member.id || index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900">{member.name || `Member ${index + 1}`}</h3>
                <p className="text-sm text-gray-600">{member.country || 'Unknown'}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">
                  {member.overall_score || 0}/100
                </div>
                <button
                  onClick={() => onRemoveFromTeam && onRemoveFromTeam(member.id)}
                  className="text-red-500 hover:text-red-700 text-sm mt-1"
                >
                  Remove
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Experience:</span>
                <span className="font-medium">{member.experience_level || 'Unknown'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Skills:</span>
                <span className="font-medium">{member.total_skills || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Salary:</span>
                <span className="font-medium">
                  {member.salary_full_time ? `$${member.salary_full_time.toLocaleString()}` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Skill Distribution Chart */}
      {chemistryAnalysis.skillDistribution && chemistryAnalysis.skillDistribution.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Team Skill Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chemistryAnalysis.skillDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recommendations */}
      {chemistryAnalysis.recommendations && chemistryAnalysis.recommendations.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recommendations</h3>
          <div className="space-y-4">
            {chemistryAnalysis.recommendations.map((rec, index) => (
              <div key={index} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{rec.type}</h4>
                    <p className="text-gray-700 mt-1">{rec.action}</p>
                    <p className="text-sm text-gray-600 mt-2">Timeline: {rec.timeline}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    rec.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                    rec.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {rec.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamChemistry;