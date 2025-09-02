import React from 'react';
import { Users, Zap, Globe, Clock } from 'lucide-react';

const TeamChemistryAnalyzer = ({ team }) => {
  const analyzeChemistry = () => {
    const countries = [...new Set(team.map(c => c.country))];
    const skills = team.flatMap(c => c.skills || []);
    const avgScore = team.reduce((sum, c) => sum + c.overall_score, 0) / team.length;
    
    return {
      diversity: countries.length,
      skillOverlap: skills.length,
      averageQuality: avgScore,
      timezoneSpread: [...new Set(team.map(c => c.timezone_group))].length
    };
  };

  const chemistry = analyzeChemistry();

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-4 flex items-center">
        <Users className="w-6 h-6 mr-2" />
        Team Chemistry Analysis
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <Globe className="w-8 h-8 mx-auto text-blue-600 mb-2" />
          <div className="text-2xl font-bold text-blue-600">{chemistry.diversity}</div>
          <div className="text-sm text-gray-600">Countries</div>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <Zap className="w-8 h-8 mx-auto text-green-600 mb-2" />
          <div className="text-2xl font-bold text-green-600">{chemistry.skillOverlap}</div>
          <div className="text-sm text-gray-600">Skills</div>
        </div>
        
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <Users className="w-8 h-8 mx-auto text-purple-600 mb-2" />
          <div className="text-2xl font-bold text-purple-600">{chemistry.averageQuality.toFixed(1)}</div>
          <div className="text-sm text-gray-600">Avg Score</div>
        </div>
        
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <Clock className="w-8 h-8 mx-auto text-orange-600 mb-2" />
          <div className="text-2xl font-bold text-orange-600">{chemistry.timezoneSpread}</div>
          <div className="text-sm text-gray-600">Timezones</div>
        </div>
      </div>

      {/* Team Recommendations */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
        <h4 className="font-semibold text-green-800 mb-2">Team Optimization Suggestions:</h4>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Add a candidate from Asia-Pacific for better timezone coverage</li>
          <li>• Consider adding mobile development skills to complement backend focus</li>
          <li>• Team diversity score: Excellent (8.5/10)</li>
        </ul>
      </div>
    </div>
  );
};

export default TeamChemistryAnalyzer;