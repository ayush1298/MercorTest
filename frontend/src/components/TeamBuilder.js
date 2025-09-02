import React from 'react';
import { Users, Award, MapPin, DollarSign } from 'lucide-react';

const TeamBuilder = ({ selectedTeam, setSelectedTeam }) => {
  const removeFromTeam = (candidateId) => {
    setSelectedTeam(selectedTeam.filter(c => c.id !== candidateId));
  };

  const teamStats = {
    avgScore: selectedTeam.length > 0 
      ? (selectedTeam.reduce((sum, c) => sum + (c.overall_score || 0), 0) / selectedTeam.length).toFixed(1)
      : 0,
    totalSalary: selectedTeam.reduce((sum, c) => sum + (c.salary_full_time || 0), 0),
    uniqueSkills: new Set(selectedTeam.flatMap(c => (c.skills_summary || '').split(','))).size,
    countries: new Set(selectedTeam.map(c => c.country)).size
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Team Builder</h2>
        <p className="text-gray-600">Build your perfect team by selecting up to 5 candidates</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-lg text-center">
          <Award className="w-8 h-8 mx-auto mb-2 text-blue-600" />
          <div className="text-2xl font-bold text-gray-800">{teamStats.avgScore}</div>
          <div className="text-sm text-gray-600">Avg Score</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-lg text-center">
          <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
          <div className="text-2xl font-bold text-gray-800">
            ${Math.round(teamStats.totalSalary / 1000)}k
          </div>
          <div className="text-sm text-gray-600">Total Salary</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-lg text-center">
          <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
          <div className="text-2xl font-bold text-gray-800">{teamStats.uniqueSkills}</div>
          <div className="text-sm text-gray-600">Unique Skills</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-lg text-center">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-orange-600" />
          <div className="text-2xl font-bold text-gray-800">{teamStats.countries}</div>
          <div className="text-sm text-gray-600">Countries</div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Selected Team ({selectedTeam.length}/5)
        </h3>
        
        {selectedTeam.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h4 className="text-lg font-semibold text-gray-600 mb-2">No team members selected</h4>
            <p className="text-gray-500">Go to the Candidates tab to start building your team</p>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedTeam.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{member.name}</h4>
                  <p className="text-sm text-gray-600">
                    {member.country} • Score: {(member.overall_score || 0).toFixed(1)} • 
                    ${member.salary_full_time ? Math.round(member.salary_full_time / 1000) + 'k' : 'N/A'}
                  </p>
                </div>
                <button
                  onClick={() => removeFromTeam(member.id)}
                  className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamBuilder;