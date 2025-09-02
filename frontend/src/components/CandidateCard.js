import React from 'react';
import { MapPin, DollarSign, Briefcase, Users, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const CandidateCard = ({ candidate, isSelected, onAdd, onRemove, teamFull }) => {
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getExperienceLevel = (experiences) => {
    if (experiences >= 5) return { label: 'Senior', color: 'bg-purple-100 text-purple-700' };
    if (experiences >= 3) return { label: 'Mid-Level', color: 'bg-blue-100 text-blue-700' };
    if (experiences >= 1) return { label: 'Junior', color: 'bg-green-100 text-green-700' };
    return { label: 'Entry', color: 'bg-gray-100 text-gray-700' };
  };

  const expLevel = getExperienceLevel(candidate.total_experiences || 0);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 transition-all duration-200 ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-gray-200'
      }`}
    >
      <div className="p-6 pb-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-1">{candidate.name}</h3>
            <div className="flex items-center text-gray-600 text-sm mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              {candidate.country}, {candidate.continent}
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(candidate.overall_score || 0)}`}>
            {(candidate.overall_score || 0).toFixed(1)}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${expLevel.color}`}>
            {expLevel.label}
          </span>
          
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
            {candidate.primary_skill_category || 'General'}
          </span>
          
          {candidate.is_full_stack && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
              Full-Stack
            </span>
          )}
          
          {candidate.has_big_tech && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
              Big Tech
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Briefcase className="w-4 h-4 text-gray-500" />
            </div>
            <div className="text-sm font-semibold text-gray-800">{candidate.total_experiences || 0}</div>
            <div className="text-xs text-gray-600">Experience</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Award className="w-4 h-4 text-gray-500" />
            </div>
            <div className="text-sm font-semibold text-gray-800">{candidate.total_skills || 0}</div>
            <div className="text-xs text-gray-600">Skills</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="w-4 h-4 text-gray-500" />
            </div>
            <div className="text-sm font-semibold text-gray-800">
              {candidate.salary_full_time 
                ? `$${Math.round(candidate.salary_full_time / 1000)}k`
                : 'N/A'
              }
            </div>
            <div className="text-xs text-gray-600">Salary</div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        {isSelected ? (
          <button
            onClick={onRemove}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4" />
            Remove from Team
          </button>
        ) : (
          <button
            onClick={onAdd}
            disabled={teamFull}
            className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
              teamFull
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Users className="w-4 h-4" />
            {teamFull ? 'Team Full' : 'Add to Team'}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default CandidateCard;