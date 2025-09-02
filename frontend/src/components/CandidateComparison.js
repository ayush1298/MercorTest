import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const CandidateComparison = ({ candidates }) => {
  const [selectedCandidates, setSelectedCandidates] = useState([]);

  const ComparisonRadarChart = () => {
    const metrics = [
      { skill: 'Overall Score', candidate1: 85, candidate2: 92 },
      { skill: 'Experience', candidate1: 70, candidate2: 88 },
      { skill: 'Skills Diversity', candidate1: 90, candidate2: 75 },
      { skill: 'Cost Efficiency', candidate1: 95, candidate2: 65 },
      { skill: 'Cultural Fit', candidate1: 80, candidate2: 85 },
    ];

    return (
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={metrics}>
          <PolarGrid />
          <PolarAngleAxis dataKey="skill" />
          <PolarRadiusAxis angle={90} domain={[0, 100]} />
          <Radar name="Candidate 1" dataKey="candidate1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.1} />
          <Radar name="Candidate 2" dataKey="candidate2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.1} />
        </RadarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-4">🔍 Smart Candidate Comparison</h3>
      <ComparisonRadarChart />
    </div>
  );
};

export default CandidateComparison;