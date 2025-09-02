import React from 'react';
import { User, MapPin, Award, DollarSign, Calendar, Code, X, Users } from 'lucide-react';

const Compare = ({ 
  compareList = [], 
  setCompareList, 
  apiBase, 
  onRemoveFromCompare, 
  onClearCompare, 
  onMoveToTeam, 
  onAddToTeam 
}) => {
  
  // Handle empty compare list
  if (!compareList || compareList.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-16">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Candidates to Compare</h2>
          <p className="text-gray-600 mb-6">
            Add candidates from the Candidates tab to compare their profiles side by side.
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

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const parseSkills = (skillsString) => {
    try {
      if (typeof skillsString === 'string' && skillsString.trim()) {
        if (skillsString.startsWith('[') && skillsString.endsWith(']')) {
          return JSON.parse(skillsString);
        }
        return skillsString.split(',').map(s => s.trim()).filter(Boolean);
      }
      return [];
    } catch (e) {
      return [];
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">⚖️ Candidate Comparison</h1>
        <p className="text-gray-600">
          Compare {compareList.length} candidate{compareList.length !== 1 ? 's' : ''} side by side
        </p>
        
        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-6">
          {onClearCompare && (
            <button
              onClick={onClearCompare}
              className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
            >
              Clear All
            </button>
          )}
          <span className="text-sm text-gray-500 self-center">
            {compareList.length}/4 candidates
          </span>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 w-40">
                  Attribute
                </th>
                {compareList.map((candidate, index) => (
                  <th key={candidate.id || index} className="px-6 py-4 text-center min-w-64">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 truncate">
                          {candidate.name || `Candidate ${index + 1}`}
                        </h3>
                        <button
                          onClick={() => onRemoveFromCompare && onRemoveFromCompare(candidate.id)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex justify-center space-x-2">
                        {onAddToTeam && (
                          <button
                            onClick={() => onAddToTeam(candidate)}
                            className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                          >
                            Add to Team
                          </button>
                        )}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-200">
              {/* Overall Score */}
              <tr>
                <td className="px-6 py-4 font-medium text-gray-900">
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4" />
                    <span>Overall Score</span>
                  </div>
                </td>
                {compareList.map((candidate, index) => (
                  <td key={candidate.id || index} className="px-6 py-4 text-center">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(candidate.overall_score || 0)}`}>
                      {(candidate.overall_score || 0).toFixed(1)}/100
                    </div>
                  </td>
                ))}
              </tr>

              {/* Location */}
              <tr className="bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>Location</span>
                  </div>
                </td>
                {compareList.map((candidate, index) => (
                  <td key={candidate.id || index} className="px-6 py-4 text-center">
                    <div>
                      <div className="font-medium">{candidate.country || 'Unknown'}</div>
                      {candidate.city && (
                        <div className="text-sm text-gray-500">{candidate.city}</div>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Experience Level */}
              <tr>
                <td className="px-6 py-4 font-medium text-gray-900">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Experience</span>
                  </div>
                </td>
                {compareList.map((candidate, index) => (
                  <td key={candidate.id || index} className="px-6 py-4 text-center">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {candidate.experience_level || 'Unknown'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Salary */}
              <tr className="bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4" />
                    <span>Expected Salary</span>
                  </div>
                </td>
                {compareList.map((candidate, index) => (
                  <td key={candidate.id || index} className="px-6 py-4 text-center">
                    <div className="font-medium text-green-600">
                      {candidate.salary_full_time ? 
                        `$${candidate.salary_full_time.toLocaleString()}` : 
                        'Not specified'
                      }
                    </div>
                  </td>
                ))}
              </tr>

              {/* Primary Skill Category */}
              <tr>
                <td className="px-6 py-4 font-medium text-gray-900">
                  <div className="flex items-center space-x-2">
                    <Code className="w-4 h-4" />
                    <span>Primary Skill</span>
                  </div>
                </td>
                {compareList.map((candidate, index) => (
                  <td key={candidate.id || index} className="px-6 py-4 text-center">
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                      {candidate.primary_skill_category || 'General'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Total Skills */}
              <tr className="bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">
                  <span>Total Skills</span>
                </td>
                {compareList.map((candidate, index) => (
                  <td key={candidate.id || index} className="px-6 py-4 text-center">
                    <span className="font-bold text-gray-900">
                      {candidate.total_skills || 0}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Key Skills */}
              <tr>
                <td className="px-6 py-4 font-medium text-gray-900">
                  <span>Key Skills</span>
                </td>
                {compareList.map((candidate, index) => (
                  <td key={candidate.id || index} className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {parseSkills(candidate.original_skills).slice(0, 5).map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                      {parseSkills(candidate.original_skills).length > 5 && (
                        <span className="text-xs text-gray-500">
                          +{parseSkills(candidate.original_skills).length - 5} more
                        </span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Special Attributes */}
              <tr className="bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">
                  <span>Highlights</span>
                </td>
                {compareList.map((candidate, index) => (
                  <td key={candidate.id || index} className="px-6 py-4">
                    <div className="space-y-1 text-center">
                      {candidate.has_big_tech && (
                        <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                          Big Tech Experience
                        </div>
                      )}
                      {candidate.has_senior_role && (
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          Senior Role
                        </div>
                      )}
                      {candidate.is_full_stack && (
                        <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          Full Stack
                        </div>
                      )}
                      {!candidate.has_big_tech && !candidate.has_senior_role && !candidate.is_full_stack && (
                        <div className="text-gray-500 text-xs">No special highlights</div>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Summary */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-4">Comparison Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Highest Score</h4>
            {(() => {
              const highest = compareList.reduce((prev, current) => 
                (current.overall_score || 0) > (prev.overall_score || 0) ? current : prev
              );
              return (
                <div>
                  <div className="font-bold text-green-600">{highest.name}</div>
                  <div className="text-sm text-gray-600">{(highest.overall_score || 0).toFixed(1)}/100</div>
                </div>
              );
            })()}
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Most Cost-Effective</h4>
            {(() => {
              const costEffective = compareList
                .filter(c => c.salary_full_time && c.salary_full_time > 0)
                .reduce((prev, current) => {
                  const prevRatio = (prev.overall_score || 0) / (prev.salary_full_time || 1);
                  const currentRatio = (current.overall_score || 0) / (current.salary_full_time || 1);
                  return currentRatio > prevRatio ? current : prev;
                }, compareList[0]);
              
              return costEffective ? (
                <div>
                  <div className="font-bold text-blue-600">{costEffective.name}</div>
                  <div className="text-sm text-gray-600">
                    ${costEffective.salary_full_time?.toLocaleString() || 'N/A'}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">No salary data</div>
              );
            })()}
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Most Skilled</h4>
            {(() => {
              const mostSkilled = compareList.reduce((prev, current) => 
                (current.total_skills || 0) > (prev.total_skills || 0) ? current : prev
              );
              return (
                <div>
                  <div className="font-bold text-purple-600">{mostSkilled.name}</div>
                  <div className="text-sm text-gray-600">{mostSkilled.total_skills || 0} skills</div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compare;