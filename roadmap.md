# Hiring Dashboard - 90-Minute Sprint Roadmap

## Project Overview
Build a streamlined hiring dashboard to analyze candidate data from [form-submissions.json](form-submissions.json) and select a diverse team of 5 people using data-driven scoring algorithms.

## Time Allocation (90 minutes total)
- **Phase 1**: Data Analysis & Scoring Model (20 minutes)
- **Phase 2**: Backend API (25 minutes) 
- **Phase 3**: Frontend Dashboard (35 minutes)
- **Phase 4**: Team Selection & Demo Prep (10 minutes)

## Phase 1: Data Analysis & Scoring Model (20 minutes)

### 1.1 Quick Data Analysis (10 minutes)
- [x] JSON to DataFrame conversion in [test.ipynb](test.ipynb)
- [ ] Identify key scoring factors from data structure:
  - Skills array length and quality
  - Work experience count and roles
  - Education level and school rankings
  - Salary expectations vs market value
  - Location diversity potential

### 1.2 Simplified Scoring Algorithm (10 minutes)
Create scoring model in Python:

```python
def calculate_candidate_score(candidate):
    score = 0
    
    # Skills Score (30 points)
    skills = candidate.get('skills', [])
    high_demand_skills = ['React', 'JavaScript', 'Python', 'Node.js', 'TypeScript', 'Java']
    skill_score = min(len(skills) * 2, 20) + sum(5 for skill in skills if skill in high_demand_skills)
    score += min(skill_score, 30)
    
    # Experience Score (25 points)
    work_exp = candidate.get('work_experiences', [])
    exp_score = min(len(work_exp) * 8, 25)
    score += exp_score
    
    # Education Score (20 points)
    education = candidate.get('education', {})
    if education.get('highest_level') == "Master's":
        score += 20
    elif education.get('highest_level') == "Bachelor's":
        score += 15
    
    # Value Score (15 points) - Lower salary expectation = higher score
    salary = candidate.get('annual_salary_expectation', {}).get('full-time', 0)
    if salary < 60000:
        score += 15
    elif salary < 80000:
        score += 10
    elif salary < 100000:
        score += 5
    
    # Profile Completeness (10 points)
    completeness = sum([
        bool(candidate.get('name')),
        bool(candidate.get('email')),
        bool(candidate.get('skills')),
        bool(candidate.get('work_experiences')),
        bool(candidate.get('education'))
    ]) * 2
    score += completeness
    
    return min(score, 100)
```

## Phase 2: Backend API (25 minutes)

### 2.1 Simple Flask API (15 minutes)
Create minimal API in Python:

```python
# app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import pandas as pd

app = Flask(__name__)
CORS(app)

# Load and process data
with open('form-submissions.json', 'r') as f:
    candidates_data = json.load(f)

# Calculate scores for all candidates
for candidate in candidates_data:
    candidate['calculated_score'] = calculate_candidate_score(candidate)

@app.route('/api/candidates', methods=['GET'])
def get_candidates():
    # Sort by score
    sorted_candidates = sorted(candidates_data, key=lambda x: x['calculated_score'], reverse=True)
    return jsonify(sorted_candidates)

@app.route('/api/candidates/top', methods=['GET'])
def get_top_candidates():
    limit = request.args.get('limit', 20, type=int)
    sorted_candidates = sorted(candidates_data, key=lambda x: x['calculated_score'], reverse=True)
    return jsonify(sorted_candidates[:limit])

@app.route('/api/team/optimize', methods=['POST'])
def optimize_team():
    # Simple diversity optimization
    sorted_candidates = sorted(candidates_data, key=lambda x: x['calculated_score'], reverse=True)
    
    selected_team = []
    used_locations = set()
    skill_coverage = set()
    
    for candidate in sorted_candidates[:50]:  # Consider top 50
        location = candidate.get('location', '').split(',')[0]  # Get country/state
        candidate_skills = set(candidate.get('skills', []))
        
        # Diversity criteria
        location_diverse = location not in used_locations or len(used_locations) < 3
        skill_diverse = len(candidate_skills - skill_coverage) > 0
        
        if (location_diverse or skill_diverse) and len(selected_team) < 5:
            selected_team.append(candidate)
            used_locations.add(location)
            skill_coverage.update(candidate_skills)
    
    return jsonify({
        'team': selected_team,
        'diversity_metrics': {
            'locations': list(used_locations),
            'total_skills': len(skill_coverage),
            'avg_score': sum(c['calculated_score'] for c in selected_team) / len(selected_team)
        }
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

### 2.2 API Testing (10 minutes)
- [ ] Test endpoints with Postman/curl
- [ ] Verify scoring algorithm works
- [ ] Ensure CORS is configured for frontend

## Phase 3: Frontend Dashboard (35 minutes)

### 3.1 Quick React Setup (10 minutes)
```bash
npx create-react-app hiring-dashboard
cd hiring-dashboard
npm install axios recharts
```

### 3.2 Core Components (25 minutes)

#### Main Dashboard Component (15 minutes)
```jsx
// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CandidateCard from './components/CandidateCard';
import TeamBuilder from './components/TeamBuilder';
import './App.css';

function App() {
  const [candidates, setCandidates] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/candidates/top?limit=50');
      setCandidates(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setLoading(false);
    }
  };

  const optimizeTeam = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/team/optimize');
      setSelectedTeam(response.data.team);
    } catch (error) {
      console.error('Error optimizing team:', error);
    }
  };

  if (loading) return <div className="loading">Loading candidates...</div>;

  return (
    <div className="App">
      <header className="app-header">
        <h1>Hiring Dashboard</h1>
        <button onClick={optimizeTeam} className="optimize-btn">
          Auto-Select Optimal Team
        </button>
      </header>
      
      <div className="main-content">
        <div className="candidates-section">
          <h2>Top Candidates (Score-based)</h2>
          <div className="candidates-grid">
            {candidates.slice(0, 20).map((candidate, index) => (
              <CandidateCard 
                key={index} 
                candidate={candidate}
                onSelect={() => {
                  if (selectedTeam.length < 5) {
                    setSelectedTeam([...selectedTeam, candidate]);
                  }
                }}
                isSelected={selectedTeam.includes(candidate)}
              />
            ))}
          </div>
        </div>
        
        <TeamBuilder 
          selectedTeam={selectedTeam}
          onRemove={(candidate) => {
            setSelectedTeam(selectedTeam.filter(c => c !== candidate));
          }}
        />
      </div>
    </div>
  );
}

export default App;
```

#### Candidate Card Component (5 minutes)
```jsx
// src/components/CandidateCard.js
import React from 'react';

const CandidateCard = ({ candidate, onSelect, isSelected }) => {
  const skillsPreview = candidate.skills?.slice(0, 3).join(', ') + 
    (candidate.skills?.length > 3 ? '...' : '');

  return (
    <div className={`candidate-card ${isSelected ? 'selected' : ''}`}>
      <div className="candidate-header">
        <h3>{candidate.name}</h3>
        <div className="score-badge">{candidate.calculated_score}</div>
      </div>
      
      <div className="candidate-info">
        <p><strong>Location:</strong> {candidate.location}</p>
        <p><strong>Skills:</strong> {skillsPreview}</p>
        <p><strong>Experience:</strong> {candidate.work_experiences?.length || 0} roles</p>
        <p><strong>Salary:</strong> ${candidate.annual_salary_expectation?.['full-time']?.toLocaleString()}</p>
      </div>
      
      <button 
        onClick={onSelect} 
        disabled={isSelected}
        className="select-btn"
      >
        {isSelected ? 'Selected' : 'Add to Team'}
      </button>
    </div>
  );
};

export default CandidateCard;
```

#### Team Builder Component (5 minutes)
```jsx
// src/components/TeamBuilder.js
import React from 'react';

const TeamBuilder = ({ selectedTeam, onRemove }) => {
  const avgScore = selectedTeam.length > 0 
    ? (selectedTeam.reduce((sum, c) => sum + c.calculated_score, 0) / selectedTeam.length).toFixed(1)
    : 0;

  const totalSkills = new Set(selectedTeam.flatMap(c => c.skills || [])).size;
  const locations = new Set(selectedTeam.map(c => c.location?.split(',')[0])).size;

  return (
    <div className="team-builder">
      <h2>Selected Team ({selectedTeam.length}/5)</h2>
      
      <div className="team-metrics">
        <div className="metric">
          <span>Avg Score:</span> {avgScore}
        </div>
        <div className="metric">
          <span>Unique Skills:</span> {totalSkills}
        </div>
        <div className="metric">
          <span>Locations:</span> {locations}
        </div>
      </div>

      <div className="team-list">
        {selectedTeam.map((candidate, index) => (
          <div key={index} className="team-member">
            <span>{candidate.name} (Score: {candidate.calculated_score})</span>
            <button onClick={() => onRemove(candidate)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamBuilder;
```

## Phase 4: Team Selection & Demo Prep (10 minutes)

### 4.1 Final Team Selection (5 minutes)
Use the auto-optimization or manual selection to choose 5 candidates based on:
- **High scores** (70+ points)
- **Geographic diversity** (3+ locations)
- **Skill complementarity** (full-stack coverage)
- **Budget efficiency** (balanced salary expectations)

### 4.2 Demo Talking Points (5 minutes)
Prepare to explain:
1. **Scoring Algorithm**: "100-point system weighing skills (30%), experience (25%), education (20%), value (15%), completeness (10%)"
2. **Diversity Optimization**: "Algorithm ensures geographic and skill diversity while maintaining quality"
3. **Team Selection**: "Final 5 candidates represent optimal balance of talent, diversity, and budget"

## Minimal File Structure
```
/project
├── form-submissions.json          # Original data
├── app.py                        # Flask API
├── scoring.py                    # Scoring algorithms
├── requirements.txt              # Python dependencies
└── /hiring-dashboard            # React app
    ├── src/
    │   ├── App.js
    │   ├── App.css
    │   └── components/
    │       ├── CandidateCard.js
    │       └── TeamBuilder.js
    └── package.json
```

## Success Criteria (90 minutes)
- [ ] Working API with candidate scoring
- [ ] Functional React dashboard
- [ ] Team of 5 selected with justification
- [ ] Basic diversity metrics displayed
- [ ] Demo-ready presentation

This streamlined approach focuses on delivering a working prototype that demonstrates data-driven hiring decisions within your time constraint.