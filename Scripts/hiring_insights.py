import pandas as pd
import numpy as np
import json
from collections import Counter, defaultdict
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

class HiringInsightsGenerator:
    def __init__(self, engineered_csv_path):
        """Initialize with your engineered candidates data"""
        self.df = pd.read_csv(engineered_csv_path)
        self.insights = {}
        
        # Enhanced skill categories from your data analysis
        self.critical_skills = {
            'high_demand_backend': ['Node JS', 'Python', 'Java', 'Express', 'Django', 'Flask'],
            'high_demand_frontend': ['React', 'JavaScript', 'TypeScript', 'Angular', 'Vue JS'],
            'data_ai': ['Machine Learning', 'Data Analysis', 'Tensorflow', 'Pytorch', 'NLP', 'Computer Vision'],
            'cloud_devops': ['Amazon Web Services', 'Docker', 'Kubernetes', 'Azure', 'Jenkins'],
            'mobile': ['React Native', 'Flutter', 'Swift', 'Kotlin'],
            'databases': ['SQL', 'PostgreSQL', 'MongoDB', 'Redis']
        }
        
        # Big tech and unicorn companies from your data
        self.tier1_companies = [
            'Google', 'Amazon', 'Microsoft', 'Apple', 'Meta', 'Netflix', 'Tesla', 'Uber', 
            'Airbnb', 'Spotify', 'PayPal', 'Oracle', 'IBM', 'Cisco', 'Twitter', 'Deloitte'
        ]
        
    def parse_skills(self, skills_str):
        """Safely parse skills from CSV string format"""
        if pd.isna(skills_str) or not skills_str or skills_str == '[]':
            return []
        
        # If it's already a string with commas, split it
        if isinstance(skills_str, str):
            # Try to eval first (for list format)
            try:
                if skills_str.startswith('[') and skills_str.endswith(']'):
                    return eval(skills_str)
            except:
                pass
            
            # Split by comma and clean
            skills = [skill.strip() for skill in skills_str.split(',') if skill.strip()]
            return skills
        
        return []
        
    def generate_market_intelligence(self):
        """Enhanced market intelligence insights"""
        insights = {}
        
        # Salary vs Skills Analysis
        skill_salary_correlation = []
        for idx, row in self.df.iterrows():
            skills = self.parse_skills(row.get('original_skills', ''))
            if skills and row['salary_full_time'] > 0:
                skill_salary_correlation.append({
                    'skills_count': len(skills),
                    'salary': row['salary_full_time'],
                    'overall_score': row['overall_score'],
                    'country': row['country'],
                    'experience_level': row.get('experience_level', 'Unknown')
                })
        
        skill_salary_df = pd.DataFrame(skill_salary_correlation)
        
        insights['market_intelligence'] = {
            'salary_skill_correlation': skill_salary_df['skills_count'].corr(skill_salary_df['salary']) if len(skill_salary_df) > 0 else 0,
            'high_value_candidates': len(self.df[(self.df['overall_score'] >= 80) & (self.df['salary_full_time'] <= 80000)]),
            'geographic_arbitrage_opportunities': self.analyze_geographic_arbitrage(),
            'skill_premium_analysis': self.analyze_skill_premiums(),
            'salary_inflation_analysis': self.analyze_salary_inflation(),
            'market_saturation': self.analyze_market_saturation()
        }
        
        return insights['market_intelligence']
    
    def analyze_geographic_arbitrage(self):
        """Enhanced geographic arbitrage with cost of living adjustments"""
        country_stats = self.df.groupby('country').agg({
            'salary_full_time': ['mean', 'median', 'count'],
            'overall_score': 'mean',
            'total_skills': 'mean',
            'has_senior_role': 'sum',
            'has_big_tech': 'sum'
        }).round(2)
        
        # Flatten column names
        country_stats.columns = ['avg_salary', 'median_salary', 'candidate_count', 'avg_score', 'avg_skills', 'senior_count', 'big_tech_count']
        
        # Filter countries with at least 5 candidates
        country_stats = country_stats[country_stats['candidate_count'] >= 5]
        
        # Calculate enhanced value score
        country_stats['value_score'] = (
            (country_stats['avg_score'] * country_stats['avg_skills']) / 
            (country_stats['avg_salary'] / 1000)
        )
        
        # Add market depth score
        country_stats['market_depth'] = (
            country_stats['candidate_count'] * 0.3 + 
            country_stats['senior_count'] * 0.4 + 
            country_stats['big_tech_count'] * 0.3
        )
        
        # Convert to regular dict with string keys
        result_dict = {}
        for col in country_stats.columns:
            result_dict[col] = {}
            for country in country_stats.index:
                result_dict[col][str(country)] = country_stats.loc[country, col]
        
        return result_dict
    
    def analyze_skill_premiums(self):
        """Enhanced skill premium analysis with market context"""
        skill_premiums = {}
        
        # Get all unique skills
        all_skills = set()
        for idx, row in self.df.iterrows():
            skills = self.parse_skills(row.get('original_skills', ''))
            all_skills.update(skills)
        
        # Focus on high-impact skills
        priority_skills = []
        for category_skills in self.critical_skills.values():
            priority_skills.extend(category_skills)
        
        # Calculate premiums for priority skills first
        skills_to_analyze = list(set(priority_skills) & all_skills) + list(all_skills - set(priority_skills))[:30]
        
        for skill in skills_to_analyze:
            candidates_with_skill = []
            candidates_without_skill = []
            experience_levels_with = []
            countries_with = []
            
            for idx, row in self.df.iterrows():
                if row['salary_full_time'] > 0:
                    skills = self.parse_skills(row.get('original_skills', ''))
                    if skill in skills:
                        candidates_with_skill.append(row['salary_full_time'])
                        experience_levels_with.append(row.get('experience_level', 'Unknown'))
                        countries_with.append(row['country'])
                    else:
                        candidates_without_skill.append(row['salary_full_time'])
            
            if len(candidates_with_skill) >= 3:  # Minimum sample size
                avg_with = np.mean(candidates_with_skill)
                avg_without = np.mean(candidates_without_skill) if candidates_without_skill else avg_with
                premium = ((avg_with - avg_without) / avg_without * 100) if avg_without > 0 else 0
                
                # Determine skill category
                skill_category = 'other'
                for category, skills_list in self.critical_skills.items():
                    if skill in skills_list:
                        skill_category = category
                        break
                
                skill_premiums[skill] = {
                    'salary_with_skill': round(avg_with, 2),
                    'salary_without_skill': round(avg_without, 2),
                    'premium_percentage': round(premium, 2),
                    'candidate_count': len(candidates_with_skill),
                    'skill_category': skill_category,
                    'market_demand': 'high' if len(candidates_with_skill) >= 20 else 'medium' if len(candidates_with_skill) >= 10 else 'low',
                    'top_countries': Counter(countries_with).most_common(3),
                    'experience_distribution': Counter(experience_levels_with)
                }
        
        # Sort by premium percentage
        sorted_premiums = dict(sorted(skill_premiums.items(), key=lambda x: x[1]['premium_percentage'], reverse=True))
        return dict(list(sorted_premiums.items())[:25])  # Top 25 skills
    
    def analyze_salary_inflation(self):
        """Analyze salary trends and inflation patterns"""
        salary_analysis = {}
        
        # Parse submission dates to analyze trends
        self.df['submitted_date'] = pd.to_datetime(self.df['submitted_at'], errors='coerce')
        
        # Group by experience level
        for exp_level in ['Entry-Level', 'Junior', 'Mid-Level', 'Senior']:
            level_data = self.df[
                (self.df.get('experience_level', '') == exp_level) & 
                (self.df['salary_full_time'] > 0)
            ]
            
            if len(level_data) > 5:
                salary_analysis[exp_level] = {
                    'avg_salary': round(level_data['salary_full_time'].mean(), 2),
                    'median_salary': round(level_data['salary_full_time'].median(), 2),
                    'salary_range': {
                        'min': round(level_data['salary_full_time'].min(), 2),
                        'max': round(level_data['salary_full_time'].max(), 2),
                        'q1': round(level_data['salary_full_time'].quantile(0.25), 2),
                        'q3': round(level_data['salary_full_time'].quantile(0.75), 2)
                    },
                    'candidate_count': len(level_data)
                }
        
        return salary_analysis
    
    def analyze_market_saturation(self):
        """Analyze market saturation for different skill combinations"""
        saturation_analysis = {}
        
        # Analyze popular skill combinations
        skill_combinations = defaultdict(int)
        
        for idx, row in self.df.iterrows():
            skills = self.parse_skills(row.get('original_skills', ''))
            if len(skills) >= 2:
                # Get most common 2-skill combinations
                for i, skill1 in enumerate(skills):
                    for skill2 in skills[i+1:]:
                        combo = tuple(sorted([skill1, skill2]))
                        skill_combinations[combo] += 1
        
        # Analyze top combinations
        for combo, count in Counter(skill_combinations).most_common(15):
            if count >= 5:
                # Calculate average score for this combination
                combo_candidates = []
                for idx, row in self.df.iterrows():
                    skills = self.parse_skills(row.get('original_skills', ''))
                    if all(skill in skills for skill in combo):
                        combo_candidates.append(row['overall_score'])
                
                saturation_analysis[f"{combo[0]} + {combo[1]}"] = {
                    'candidate_count': count,
                    'avg_score': round(np.mean(combo_candidates), 2) if combo_candidates else 0,
                    'saturation_level': 'high' if count >= 20 else 'medium' if count >= 10 else 'low'
                }
        
        return saturation_analysis
    
    def generate_team_composition_insights(self):
        """Enhanced team composition insights"""
        insights = {}
        
        # Enhanced diversity analysis
        insights['diversity_metrics'] = {
            'geographic_diversity': len(self.df['country'].unique()),
            'skill_category_diversity': len(self.df['primary_skill_category'].unique()),
            'experience_level_distribution': self.df.get('experience_level', pd.Series()).value_counts().to_dict(),
            'salary_range_distribution': self.df.get('budget_category', pd.Series()).value_counts().to_dict(),
            'timezone_diversity': len(self.df['timezone_group'].unique()),
            'education_diversity': self.df['highest_education_level'].value_counts().to_dict()
        }
        
        # Enhanced complementary skills analysis
        insights['skill_complementarity'] = self.analyze_skill_complementarity()
        
        # Enhanced team templates
        insights['team_templates'] = self.generate_enhanced_team_templates()
        
        # Team chemistry analysis
        insights['team_chemistry'] = self.analyze_team_chemistry()
        
        return insights
    
    def analyze_skill_complementarity(self):
        """Enhanced skill complementarity analysis"""
        skill_combinations = defaultdict(list)
        
        for idx, row in self.df.iterrows():
            skills = self.parse_skills(row.get('original_skills', ''))
            if skills and row['overall_score'] >= 70 and len(skills) >= 3:
                # Create skill pairs from different categories
                categorized_skills = {category: [] for category in self.critical_skills.keys()}
                
                for skill in skills:
                    for category, category_skills in self.critical_skills.items():
                        if skill in category_skills:
                            categorized_skills[category].append(skill)
                
                # Cross-category combinations are more valuable
                for cat1, skills1 in categorized_skills.items():
                    for cat2, skills2 in categorized_skills.items():
                        if cat1 != cat2 and skills1 and skills2:
                            for skill1 in skills1:
                                for skill2 in skills2:
                                    pair = tuple(sorted([skill1, skill2]))
                                    skill_combinations[pair].append({
                                        'score': row['overall_score'],
                                        'salary': row['salary_full_time'],
                                        'country': row['country']
                                    })
        
        # Find most effective combinations
        effective_combinations = {}
        for pair, candidates in skill_combinations.items():
            if len(candidates) >= 3:
                scores = [c['score'] for c in candidates]
                salaries = [c['salary'] for c in candidates if c['salary'] > 0]
                countries = [c['country'] for c in candidates]
                
                effective_combinations[f"{pair[0]} + {pair[1]}"] = {
                    'avg_score': round(np.mean(scores), 2),
                    'frequency': len(candidates),
                    'score_variance': round(np.std(scores), 2),
                    'avg_salary': round(np.mean(salaries), 2) if salaries else 0,
                    'geographic_spread': len(set(countries)),
                    'value_rating': round(np.mean(scores) / (np.mean(salaries) / 1000), 2) if salaries else 0
                }
        
        # Sort by value rating (score per salary unit)
        sorted_combinations = dict(sorted(effective_combinations.items(), key=lambda x: x[1]['value_rating'], reverse=True))
        return dict(list(sorted_combinations.items())[:20])
    
    def generate_enhanced_team_templates(self):
        """Generate enhanced team composition templates"""
        templates = {}
        
        # Startup MVP Team (scrappy, full-stack, budget-conscious)
        startup_criteria = (
            (self.df['salary_full_time'] <= 75000) & 
            (self.df['overall_score'] >= 65) & 
            (self.df['is_full_stack'] == True)
        )
        startup_candidates = self.df[startup_criteria].nlargest(20, 'overall_score')
        
        # Scale-up Team (proven experience, balanced skills)
        scaleup_criteria = (
            (self.df['total_experiences'] >= 2) & 
            (self.df['overall_score'] >= 70) &
            (self.df['salary_full_time'] <= 120000)
        )
        scaleup_candidates = self.df[scaleup_criteria].nlargest(20, 'overall_score')
        
        # Enterprise Team (senior roles, diverse backgrounds)
        enterprise_criteria = (
            (self.df['has_senior_role'] == True) & 
            (self.df['total_experiences'] >= 3) & 
            (self.df['overall_score'] >= 75)
        )
        enterprise_candidates = self.df[enterprise_criteria].nlargest(20, 'overall_score')
        
        # AI/Data Team (cutting-edge, research-focused)
        ai_criteria = (
            (self.df['primary_skill_category'].isin(['data', 'languages'])) & 
            (self.df['has_cs_degree'] == True) & 
            (self.df['overall_score'] >= 70)
        )
        ai_candidates = self.df[ai_criteria].nlargest(20, 'overall_score')
        
        # Remote-First Global Team (timezone diversity, communication skills)
        remote_criteria = (
            (self.df['overall_score'] >= 65) &
            (self.df['salary_full_time'] <= 100000)
        )
        remote_candidates = self.df[remote_criteria].groupby('timezone_group').apply(
            lambda x: x.nlargest(3, 'overall_score')
        ).reset_index(drop=True)
        
        templates = {
            'startup_mvp': {
                'description': 'Scrappy full-stack team for MVP development',
                'ideal_size': 3,
                'avg_salary': startup_candidates['salary_full_time'].mean() if len(startup_candidates) > 0 else 0,
                'avg_score': startup_candidates['overall_score'].mean() if len(startup_candidates) > 0 else 0,
                'key_traits': ['full-stack', 'budget-conscious', 'high-potential'],
                'top_candidates': startup_candidates[['name', 'overall_score', 'salary_full_time', 'country']].head(5).to_dict('records') if len(startup_candidates) > 0 else []
            },
            'scale_up': {
                'description': 'Balanced team for scaling existing product',
                'ideal_size': 5,
                'avg_salary': scaleup_candidates['salary_full_time'].mean() if len(scaleup_candidates) > 0 else 0,
                'avg_score': scaleup_candidates['overall_score'].mean() if len(scaleup_candidates) > 0 else 0,
                'key_traits': ['proven-experience', 'balanced-skills', 'growth-ready'],
                'top_candidates': scaleup_candidates[['name', 'overall_score', 'salary_full_time', 'country']].head(5).to_dict('records') if len(scaleup_candidates) > 0 else []
            },
            'enterprise': {
                'description': 'Senior team for complex enterprise solutions',
                'ideal_size': 5,
                'avg_salary': enterprise_candidates['salary_full_time'].mean() if len(enterprise_candidates) > 0 else 0,
                'avg_score': enterprise_candidates['overall_score'].mean() if len(enterprise_candidates) > 0 else 0,
                'key_traits': ['senior-experience', 'enterprise-ready', 'leadership'],
                'top_candidates': enterprise_candidates[['name', 'overall_score', 'salary_full_time', 'country']].head(5).to_dict('records') if len(enterprise_candidates) > 0 else []
            },
            'ai_innovation': {
                'description': 'AI/ML focused team for cutting-edge development',
                'ideal_size': 4,
                'avg_salary': ai_candidates['salary_full_time'].mean() if len(ai_candidates) > 0 else 0,
                'avg_score': ai_candidates['overall_score'].mean() if len(ai_candidates) > 0 else 0,
                'key_traits': ['ai-ml-expertise', 'research-background', 'innovation-focused'],
                'top_candidates': ai_candidates[['name', 'overall_score', 'salary_full_time', 'country']].head(5).to_dict('records') if len(ai_candidates) > 0 else []
            },
            'remote_global': {
                'description': 'Timezone-distributed remote team',
                'ideal_size': 6,
                'avg_salary': remote_candidates['salary_full_time'].mean() if len(remote_candidates) > 0 else 0,
                'avg_score': remote_candidates['overall_score'].mean() if len(remote_candidates) > 0 else 0,
                'key_traits': ['remote-ready', 'timezone-diversity', 'communication-skills'],
                'timezone_coverage': remote_candidates['timezone_group'].value_counts().to_dict() if len(remote_candidates) > 0 else {},
                'top_candidates': remote_candidates[['name', 'overall_score', 'salary_full_time', 'country', 'timezone_group']].head(6).to_dict('records') if len(remote_candidates) > 0 else []
            }
        }
        
        return templates
    
    def calculate_skill_overlap(self):
        """Calculate healthy skill overlap vs specialization"""
        skill_freq = Counter()
        
        for idx, row in self.df.iterrows():
            skills = self.parse_skills(row.get('original_skills', ''))
            skill_freq.update(skills)
        
        total_skills = len(skill_freq)
        common_skills = len([skill for skill, count in skill_freq.items() if count >= 10])
        
        return {
            'total_unique_skills': total_skills,
            'common_skills_count': common_skills,
            'specialization_ratio': (total_skills - common_skills) / total_skills if total_skills > 0 else 0,
            'most_common_skills': dict(skill_freq.most_common(10))
        }
    
    def analyze_team_chemistry(self):
        """Analyze potential team chemistry factors"""
        chemistry_analysis = {}
        
        # Education background compatibility
        try:
            edu_combinations = self.df.groupby(['highest_education_level', 'has_cs_degree']).agg({
                'overall_score': 'mean',
                'name': 'count'
            }).round(2)
            
            # Convert multi-index to string keys
            edu_dict = {}
            for (level, has_cs), row in edu_combinations.iterrows():
                key = f"{level}_CS_{has_cs}"
                edu_dict[key] = {
                    'overall_score': row['overall_score'],
                    'count': row['name']
                }
            chemistry_analysis['education_compatibility'] = edu_dict
        except:
            chemistry_analysis['education_compatibility'] = {}
        
        # Experience level balance analysis
        try:
            exp_balance = self.df.groupby('experience_level').agg({
                'overall_score': 'mean',
                'salary_full_time': 'mean',
                'name': 'count'
            }).round(2)
            chemistry_analysis['experience_balance'] = exp_balance.to_dict('index')
        except:
            chemistry_analysis['experience_balance'] = {}
        
        chemistry_analysis['cultural_diversity_score'] = len(self.df['country'].unique()) / len(self.df) * 100
        chemistry_analysis['skill_overlap_analysis'] = self.calculate_skill_overlap()
        
        return chemistry_analysis
    
    def generate_hiring_strategy_insights(self):
        """Enhanced strategic hiring insights"""
        insights = {}
        
        # Enhanced talent scarcity analysis
        insights['talent_scarcity'] = self.analyze_talent_scarcity()
        
        # Competition analysis
        insights['competition_analysis'] = self.analyze_competition_indicators()
        
        # Hiring urgency recommendations
        insights['urgency_recommendations'] = self.generate_urgency_recommendations()
        
        # Market timing analysis
        insights['market_timing'] = self.analyze_market_timing()
        
        # Risk assessment
        insights['hiring_risks'] = self.assess_hiring_risks()
        
        return insights
    
    def analyze_talent_scarcity(self):
        """Analyze scarcity of different skill combinations"""
        scarcity_analysis = {}
        
        # High-demand, low-supply skills
        skill_demand = Counter()
        for idx, row in self.df.iterrows():
            skills = self.parse_skills(row.get('original_skills', ''))
            skill_demand.update(skills)
        
        # Calculate scarcity score (demand vs quality candidates)
        for skill, count in skill_demand.most_common(30):
            quality_candidates = 0
            for idx, row in self.df.iterrows():
                if row['overall_score'] >= 80:
                    skills = self.parse_skills(row.get('original_skills', ''))
                    if skill in skills:
                        quality_candidates += 1
            
            scarcity_score = count / max(quality_candidates, 1)
            scarcity_analysis[skill] = {
                'total_candidates': count,
                'quality_candidates': quality_candidates,
                'scarcity_score': round(scarcity_score, 2)
            }
        
        # Sort by scarcity (high demand, low quality supply)
        sorted_scarcity = dict(sorted(scarcity_analysis.items(), key=lambda x: x[1]['scarcity_score'], reverse=True))
        return dict(list(sorted_scarcity.items())[:15])
    
    def analyze_competition_indicators(self):
        """Analyze indicators of candidate competitiveness"""
        competition_indicators = {}
        
        # High-value candidates likely to have multiple offers
        high_competition = self.df[
            (self.df['overall_score'] >= 85) & 
            (self.df['salary_full_time'] <= 100000) & 
            (self.df['has_big_tech'] == True)
        ]
        
        competition_indicators['high_competition_candidates'] = len(high_competition)
        competition_indicators['avg_score_threshold'] = 85
        competition_indicators['competitive_locations'] = high_competition['country'].value_counts().to_dict()
        
        return competition_indicators
    
    def generate_urgency_recommendations(self):
        """Generate recommendations for hiring urgency"""
        recommendations = []
        
        # Immediate hire recommendations
        immediate_candidates = self.df[
            (self.df['overall_score'] >= 80) & 
            (self.df['salary_full_time'] <= 90000) & 
            (self.df['is_full_stack'] == True)
        ].nlargest(10, 'overall_score')
        
        recommendations.append({
            'priority': 'IMMEDIATE',
            'reason': 'High-value full-stack candidates with reasonable salary expectations',
            'count': len(immediate_candidates),
            'candidates': immediate_candidates[['name', 'overall_score', 'salary_full_time']].to_dict('records')
        })
        
        # Strategic hire recommendations
        strategic_candidates = self.df[
            (self.df['has_lead_role'] == True) & 
            (self.df['overall_score'] >= 75)
        ].nlargest(10, 'overall_score')
        
        recommendations.append({
            'priority': 'STRATEGIC',
            'reason': 'Leadership experience candidates for senior positions',
            'count': len(strategic_candidates),
            'candidates': strategic_candidates[['name', 'overall_score', 'salary_full_time']].to_dict('records')
        })
        
        return recommendations
    
    def analyze_market_timing(self):
        """Analyze market timing for different hiring strategies"""
        timing_analysis = {}
        
        # Parse submission dates
        self.df['submitted_date'] = pd.to_datetime(self.df['submitted_at'], errors='coerce')
        
        # Recent application trends
        recent_data = self.df[self.df['submitted_date'] >= '2025-01-26']
        
        timing_analysis = {
            'recent_application_volume': len(recent_data),
            'quality_trend': {
                'avg_score_recent': recent_data['overall_score'].mean() if len(recent_data) > 0 else 0,
                'avg_score_overall': self.df['overall_score'].mean()
            },
            'skill_demand_shifts': self.analyze_skill_trends(recent_data),
            'optimal_hiring_window': 'immediate' if len(recent_data) > 50 else 'monitor'
        }
        
        return timing_analysis
    
    def analyze_skill_trends(self, recent_data):
        """Analyze trending skills in recent applications"""
        if len(recent_data) == 0:
            return {}
        
        recent_skills = Counter()
        overall_skills = Counter()
        
        # Recent skills
        for idx, row in recent_data.iterrows():
            skills = self.parse_skills(row.get('original_skills', ''))
            recent_skills.update(skills)
        
        # Overall skills
        for idx, row in self.df.iterrows():
            skills = self.parse_skills(row.get('original_skills', ''))
            overall_skills.update(skills)
        
        # Calculate trend shifts
        trending_skills = {}
        for skill in recent_skills.keys():
            recent_freq = recent_skills[skill] / len(recent_data)
            overall_freq = overall_skills[skill] / len(self.df)
            
            if recent_freq > overall_freq * 1.2:  # 20% increase threshold
                trending_skills[skill] = {
                    'recent_frequency': recent_freq,
                    'overall_frequency': overall_freq,
                    'trend_strength': (recent_freq - overall_freq) / overall_freq
                }
        
        return dict(sorted(trending_skills.items(), key=lambda x: x[1]['trend_strength'], reverse=True)[:10])
    
    def assess_hiring_risks(self):
        """Assess various hiring risks and mitigation strategies"""
        risk_assessment = {}
        
        # Talent flight risk (high-quality, high-salary candidates)
        flight_risk = self.df[
            (self.df['overall_score'] >= 85) & 
            (self.df['salary_full_time'] >= 120000) &
            (self.df['has_big_tech'] == True)
        ]
        
        # Skill shortage risk
        critical_skill_shortage = {}
        for category, skills in self.critical_skills.items():
            candidates_with_category = 0
            for skill in skills:
                for idx, row in self.df.iterrows():
                    candidate_skills = self.parse_skills(row.get('original_skills', ''))
                    if skill in candidate_skills:
                        candidates_with_category += 1
                        break  # Count each candidate only once per category
            
            critical_skill_shortage[category] = {
                'total_candidates': candidates_with_category,
                'risk_level': 'high' if candidates_with_category < 20 else 'medium' if candidates_with_category < 50 else 'low'
            }
        
        # Geographic concentration risk
        top_countries = self.df['country'].value_counts().head(3)
        geographic_concentration = top_countries.sum() / len(self.df)
        
        risk_assessment = {
            'talent_flight_risk': {
                'high_risk_candidates': len(flight_risk),
                'mitigation': 'competitive_offers_and_equity'
            },
            'skill_shortage_risks': critical_skill_shortage,
            'geographic_concentration': {
                'concentration_ratio': geographic_concentration,
                'risk_level': 'high' if geographic_concentration > 0.7 else 'medium' if geographic_concentration > 0.5 else 'low',
                'top_countries': top_countries.to_dict()
            },
            'budget_inflation_risk': {
                'avg_salary_top_quartile': self.df.nlargest(int(len(self.df) * 0.25), 'overall_score')['salary_full_time'].mean(),
                'market_rate_pressure': 'increasing'
            }
        }
        
        return risk_assessment
    
    def generate_actionable_recommendations(self):
        """Generate specific, actionable hiring recommendations"""
        recommendations = {}
        
        # Immediate action items
        immediate_actions = []
        
        # High-value, low-cost candidates
        bargain_candidates = self.df[
            (self.df['overall_score'] >= 75) &
            (self.df['salary_full_time'] <= 60000) &
            (self.df['salary_full_time'] > 0)
        ].nlargest(5, 'overall_score')
        
        if len(bargain_candidates) > 0:
            immediate_actions.append({
                'action': 'immediate_outreach',
                'priority': 'HIGH',
                'description': f'Contact {len(bargain_candidates)} high-value, budget-friendly candidates',
                'candidates': bargain_candidates[['name', 'overall_score', 'salary_full_time', 'country']].to_dict('records'),
                'timeline': '24-48 hours'
            })
        
        # Skill gap filling
        skill_gaps = self.identify_skill_gaps()
        if skill_gaps:
            immediate_actions.append({
                'action': 'skill_gap_targeting',
                'priority': 'MEDIUM',
                'description': 'Target candidates with scarce but critical skills',
                'skills_needed': skill_gaps,
                'timeline': '1-2 weeks'
            })
        
        # Geographic diversification
        underrepresented_regions = self.identify_geographic_opportunities()
        if underrepresented_regions:
            immediate_actions.append({
                'action': 'geographic_expansion',
                'priority': 'MEDIUM',
                'description': 'Expand hiring in underrepresented but valuable regions',
                'target_regions': underrepresented_regions,
                'timeline': '2-4 weeks'
            })
        
        recommendations = {
            'immediate_actions': immediate_actions,
            'team_building_strategies': self.generate_team_building_strategies(),
            'budget_optimization_tactics': self.generate_budget_tactics(),
            'long_term_pipeline': self.generate_pipeline_strategy()
        }
        
        return recommendations
    
    def identify_skill_gaps(self):
        """Identify critical skill gaps in the candidate pool"""
        gaps = []
        
        for category, skills in self.critical_skills.items():
            category_count = 0
            for skill in skills:
                for idx, row in self.df.iterrows():
                    candidate_skills = self.parse_skills(row.get('original_skills', ''))
                    if skill in candidate_skills:
                        category_count += 1
                        break  # Count each candidate only once per category
            
            if category_count < 15:  # Threshold for scarcity
                gaps.append({
                    'category': category,
                    'skills': skills,
                    'current_candidates': category_count,
                    'urgency': 'high' if category_count < 10 else 'medium'
                })
        
        return gaps
    
    def identify_geographic_opportunities(self):
        """Identify underrepresented geographic regions with potential"""
        country_stats = self.df.groupby('country').agg({
            'overall_score': 'mean',
            'salary_full_time': 'mean',
            'name': 'count'
        }).round(2)
        
        # Find countries with high quality but low representation
        opportunities = []
        for country, stats in country_stats.iterrows():
            if stats['name'] < 10 and stats['overall_score'] > 70:  # Less than 10 candidates but high quality
                opportunities.append({
                    'country': country,
                    'avg_score': stats['overall_score'],
                    'avg_salary': stats['salary_full_time'],
                    'candidate_count': stats['name']
                })
        
        return sorted(opportunities, key=lambda x: x['avg_score'], reverse=True)[:5]
    
    def generate_team_building_strategies(self):
        """Generate specific team building strategies"""
        strategies = []
        
        # Core team strategy
        core_team = self.df[
            (self.df['overall_score'] >= 80) &
            (self.df['is_full_stack'] == True) &
            (self.df['salary_full_time'] <= 90000)
        ].head(3)
        
        if len(core_team) > 0:
            strategies.append({
                'strategy': 'core_team_first',
                'description': 'Build strong core team with full-stack capabilities',
                'candidates': core_team[['name', 'overall_score', 'primary_skill_category']].to_dict('records'),
                'budget_estimate': core_team['salary_full_time'].sum()
            })
        
        # Specialization strategy
        specialists = []
        for category in ['data', 'cloud', 'mobile']:
            specialist = self.df[
                (self.df['primary_skill_category'] == category) &
                (self.df['overall_score'] >= 75)
            ].nlargest(1, 'overall_score')
            
            if len(specialist) > 0:
                specialists.extend(specialist.to_dict('records'))
        
        if specialists:
            strategies.append({
                'strategy': 'specialist_addition',
                'description': 'Add specialists for key technical areas',
                'specialists': specialists,
                'total_budget': sum([s.get('salary_full_time', 0) for s in specialists])
            })
        
        return strategies
    
    def generate_budget_tactics(self):
        """Generate budget optimization tactics"""
        tactics = []
        
        # Geographic arbitrage tactic
        arbitrage_countries = self.df.groupby('country').agg({
            'overall_score': 'mean',
            'salary_full_time': 'mean',
            'name': 'count'
        }).round(2)
        
        # Find countries with high quality, low cost
        value_countries = arbitrage_countries[
            (arbitrage_countries['overall_score'] > 70) &
            (arbitrage_countries['salary_full_time'] < 80000) &
            (arbitrage_countries['name'] >= 5)
        ].sort_values('overall_score', ascending=False)
        
        if len(value_countries) > 0:
            tactics.append({
                'tactic': 'geographic_arbitrage',
                'description': 'Focus hiring in high-value, lower-cost countries',
                'target_countries': value_countries.head(3).to_dict(),
                'potential_savings': '20-40% vs US market rates'
            })
        
        # Junior-senior mix tactic
        junior_talent = self.df[
            (self.df['experience_level'] == 'Junior') &
            (self.df['overall_score'] >= 70)
        ]
        
        senior_talent = self.df[
            (self.df['experience_level'] == 'Senior') &
            (self.df['overall_score'] >= 80)
        ]
        
        if len(junior_talent) > 0 and len(senior_talent) > 0:
            tactics.append({
                'tactic': 'optimal_seniority_mix',
                'description': '2:1 ratio of high-potential junior to proven senior talent',
                'junior_avg_cost': junior_talent['salary_full_time'].mean(),
                'senior_avg_cost': senior_talent['salary_full_time'].mean(),
                'recommended_ratio': '2 junior : 1 senior'
            })
        
        return tactics
    
    def generate_pipeline_strategy(self):
        """Generate long-term talent pipeline strategy"""
        pipeline = {}
        
        # Identify emerging talent
        emerging_talent = self.df[
            (self.df['experience_level'].isin(['Entry-Level', 'Junior'])) &
            (self.df['overall_score'] >= 75) &
            (self.df['has_cs_degree'] == True)
        ]
        
        # University partnerships
        top_schools = self.df[self.df['has_top_school'] == True]['highest_education_level'].value_counts()
        
        pipeline = {
            'emerging_talent_pool': {
                'total_candidates': len(emerging_talent),
                'avg_score': emerging_talent['overall_score'].mean() if len(emerging_talent) > 0 else 0,
                'growth_potential': 'high'
            },
            'university_partnerships': {
                'target_schools': top_schools.to_dict() if len(top_schools) > 0 else {},
                'focus_degrees': ['Computer Science', 'Data Science', 'Software Engineering']
            },
            'skill_development_programs': {
                'internal_training': ['AI/ML', 'Cloud Architecture', 'Full-Stack Development'],
                'external_partnerships': ['Bootcamps', 'Online Platforms', 'Certification Programs']
            }
        }
        
        return pipeline
    
    def generate_budget_optimization_insights(self):
        """Generate budget optimization insights"""
        insights = {}
        
        # Cost per skill analysis
        insights['cost_efficiency'] = self.analyze_cost_efficiency()
        
        # Budget allocation strategies
        insights['budget_strategies'] = self.generate_budget_strategies()
        
        return insights
    
    def analyze_cost_efficiency(self):
        """Analyze cost efficiency of different candidate profiles"""
        efficiency_analysis = {}
        
        # Cost per skill point
        candidates_with_salary = self.df[self.df['salary_full_time'] > 0].copy()
        candidates_with_salary['cost_per_skill'] = candidates_with_salary['salary_full_time'] / candidates_with_salary['total_skills']
        candidates_with_salary['value_score'] = candidates_with_salary['overall_score'] / (candidates_with_salary['salary_full_time'] / 1000)
        
        efficiency_analysis['top_value_candidates'] = candidates_with_salary.nlargest(10, 'value_score')[
            ['name', 'overall_score', 'salary_full_time', 'value_score', 'country']
        ].to_dict('records')
        
        efficiency_analysis['cost_per_skill_by_country'] = candidates_with_salary.groupby('country')['cost_per_skill'].mean().sort_values().head(10).to_dict()
        
        return efficiency_analysis
    
    def generate_budget_strategies(self):
        """Generate different budget allocation strategies"""
        strategies = {}
        
        budgets = [400000, 500000, 600000]  # Different team budgets
        
        for budget in budgets:
            strategy = self.optimize_team_for_budget(budget)
            strategies[f'${budget:,}'] = strategy
        
        return strategies
    
    def optimize_team_for_budget(self, total_budget):
        """Optimize team selection for a specific budget"""
        eligible_candidates = self.df[
            (self.df['salary_full_time'] > 0) & 
            (self.df['salary_full_time'] <= total_budget * 0.4) & 
            (self.df['overall_score'] >= 60)
        ].copy()
        
        # Simple greedy optimization
        selected_team = []
        remaining_budget = total_budget
        used_countries = set()
        covered_skills = set()
        
        # Sort by value score
        eligible_candidates['value_score'] = eligible_candidates['overall_score'] / (eligible_candidates['salary_full_time'] / 1000)
        eligible_candidates = eligible_candidates.sort_values('value_score', ascending=False)
        
        for idx, candidate in eligible_candidates.iterrows():
            if len(selected_team) >= 5:
                break
                
            if candidate['salary_full_time'] <= remaining_budget:
                # Diversity bonus
                diversity_bonus = 0
                if candidate['country'] not in used_countries:
                    diversity_bonus += 5
                if len(used_countries) < 3:
                    diversity_bonus += 2
                
                candidate_score = candidate['overall_score'] + diversity_bonus
                
                selected_team.append({
                    'name': candidate['name'],
                    'score': candidate['overall_score'],
                    'salary': candidate['salary_full_time'],
                    'country': candidate['country'],
                    'skills': candidate['primary_skill_category'],
                    'adjusted_score': candidate_score
                })
                
                remaining_budget -= candidate['salary_full_time']
                used_countries.add(candidate['country'])
                
                # Track covered skills
                skills = self.parse_skills(candidate.get('original_skills', ''))
                covered_skills.update(skills)
        
        return {
            'team_size': len(selected_team),
            'total_cost': total_budget - remaining_budget,
            'remaining_budget': remaining_budget,
            'avg_score': np.mean([member['score'] for member in selected_team]) if selected_team else 0,
            'countries_represented': len(used_countries),
            'skills_covered': len(covered_skills),
            'team_members': selected_team
        }
    
    def generate_comprehensive_report(self):
        """Generate the most comprehensive hiring insights report"""
        print("🔍 Generating Ultra-Comprehensive Hiring Insights...")
        
        report = {
            'timestamp': datetime.now().isoformat(),
            'executive_summary': self.generate_executive_summary(),
            'dataset_overview': self.generate_dataset_overview(),
            'market_intelligence': self.generate_market_intelligence(),
            'team_composition': self.generate_team_composition_insights(),
            'hiring_strategy': self.generate_hiring_strategy_insights(),
            'budget_optimization': self.generate_budget_optimization_insights(),
            'actionable_recommendations': self.generate_actionable_recommendations(),
            'risk_mitigation': self.assess_hiring_risks(),
            'success_metrics': self.define_success_metrics()
        }
        
        return report
    
    def generate_executive_summary(self):
        """Generate executive summary with key insights"""
        high_value_candidates = len(self.df[
            (self.df['overall_score'] >= 80) & 
            (self.df['salary_full_time'] <= 100000)
        ])
        
        avg_score = self.df['overall_score'].mean()
        total_countries = len(self.df['country'].unique())
        
        return {
            'total_candidates_analyzed': len(self.df),
            'high_value_opportunities': high_value_candidates,
            'global_talent_reach': total_countries,
            'average_candidate_quality': round(avg_score, 1),
            'key_recommendation': 'Focus on geographic arbitrage and full-stack capabilities',
            'immediate_action_required': high_value_candidates > 20,
            'market_opportunity_score': round((high_value_candidates / len(self.df)) * 100, 1)
        }
    
    def generate_dataset_overview(self):
        """Generate comprehensive dataset overview with fixed skills parsing"""
        # Get all unique skills safely
        all_skills = set()
        for idx, row in self.df.iterrows():
            skills = self.parse_skills(row.get('original_skills', ''))
            all_skills.update(skills)
        
        return {
            'total_candidates': len(self.df),
            'score_distribution': {
                'mean': round(self.df['overall_score'].mean(), 2),
                'median': round(self.df['overall_score'].median(), 2),
                'std': round(self.df['overall_score'].std(), 2),
                'top_10_percent_threshold': round(self.df['overall_score'].quantile(0.9), 2),
                'top_25_percent_threshold': round(self.df['overall_score'].quantile(0.75), 2)
            },
            'geographic_coverage': {
                'total_countries': len(self.df['country'].unique()),
                'top_5_countries': self.df['country'].value_counts().head(5).to_dict(),
                'timezone_coverage': self.df['timezone_group'].value_counts().to_dict()
            },
            'skill_landscape': {
                'total_unique_skills': len(all_skills),
                'skill_categories': self.df['primary_skill_category'].value_counts().to_dict(),
                'full_stack_candidates': len(self.df[self.df['is_full_stack'] == True])
            },
            'experience_profile': {
                'experience_levels': self.df.get('experience_level', pd.Series()).value_counts().to_dict(),
                'big_tech_background': len(self.df[self.df['has_big_tech'] == True]),
                'senior_roles': len(self.df[self.df['has_senior_role'] == True])
            },
            'salary_insights': {
                'candidates_with_salary': len(self.df[self.df['salary_full_time'] > 0]),
                'avg_salary_expectation': round(self.df[self.df['salary_full_time'] > 0]['salary_full_time'].mean(), 2),
                'salary_range': {
                    'min': self.df[self.df['salary_full_time'] > 0]['salary_full_time'].min(),
                    'max': self.df[self.df['salary_full_time'] > 0]['salary_full_time'].max(),
                    'median': round(self.df[self.df['salary_full_time'] > 0]['salary_full_time'].median(), 2)
                }
            }
        }
    
    def define_success_metrics(self):
        """Define success metrics for hiring decisions"""
        return {
            'quality_metrics': {
                'target_avg_score': 75,
                'min_acceptable_score': 65,
                'target_senior_ratio': 0.3
            },
            'diversity_metrics': {
                'target_countries': 5,
                'target_timezone_coverage': 3,
                'target_skill_categories': 6
            },
            'budget_metrics': {
                'target_cost_per_hire': 80000,
                'target_value_ratio': 1.0,  # score per 1k salary
                'budget_efficiency_target': 0.8
            },
            'timeline_metrics': {
                'target_time_to_hire': '2-3 weeks',
                'pipeline_fill_rate': '80%',
                'offer_acceptance_rate': '75%'
            }
        }
    
    def save_insights_report(self, filename='comprehensive_hiring_insights.json'):
        """Save the ultra-comprehensive insights to JSON file"""
        report = self.generate_comprehensive_report()
        
        with open(filename, 'w') as f:
            json.dump(report, f, indent=2, default=str)
        
        print(f"💾 Ultra-comprehensive hiring insights saved to {filename}")
        return report

# Enhanced usage function
def generate_hiring_dashboard_insights():
    """Enhanced main function to generate insights for hiring dashboard"""
    print("🚀 Starting Ultra-Comprehensive Hiring Intelligence Analysis...")
    print("=" * 70)
    
    # Initialize insights generator
    try:
        insights_gen = HiringInsightsGenerator('engineered_candidates_final.csv')
    except FileNotFoundError:
        print("❌ Could not find 'engineered_candidates_final.csv'")
        print("   Trying 'engineered_candidates.csv'...")
        try:
            insights_gen = HiringInsightsGenerator('engineered_candidates.csv')
        except FileNotFoundError:
            print("❌ Could not find candidate data file. Please run feature engineering first.")
            return None
    
    # Generate comprehensive report
    report = insights_gen.save_insights_report()
    
    # Print enhanced insights for demo
    print("\n" + "="*70)
    print("🎯 ULTRA-COMPREHENSIVE HIRING INSIGHTS FOR DEMO")
    print("="*70)
    
    # Executive Summary
    exec_summary = report['executive_summary']
    print(f"\n📋 EXECUTIVE SUMMARY:")
    print(f"   • Total Talent Pool: {exec_summary['total_candidates_analyzed']:,} candidates")
    print(f"   • High-Value Opportunities: {exec_summary['high_value_opportunities']} candidates")
    print(f"   • Global Reach: {exec_summary['global_talent_reach']} countries")
    print(f"   • Average Quality Score: {exec_summary['average_candidate_quality']}/100")
    print(f"   • Market Opportunity: {exec_summary['market_opportunity_score']}% high-value candidates")
    
    # Top Actionable Insights
    if 'actionable_recommendations' in report:
        print(f"\n⚡ IMMEDIATE ACTION ITEMS:")
        for action in report['actionable_recommendations']['immediate_actions'][:3]:
            print(f"   • {action['priority']}: {action['description']}")
            print(f"     Timeline: {action['timeline']}")
    
    # Market Intelligence
    market_intel = report['market_intelligence']
    print(f"\n🌍 GEOGRAPHIC ARBITRAGE OPPORTUNITIES:")
    geo_arb = market_intel['geographic_arbitrage_opportunities']
    for country, stats in list(geo_arb.items())[:3]:
        if isinstance(stats, dict) and 'avg_score' in stats:
            print(f"   • {country}: Quality {stats['avg_score']:.1f}/100, Avg Salary ${stats['avg_salary']:,.0f}")
    
    # Skill Premium Analysis
    print(f"\n🔥 TOP SKILL PREMIUMS:")
    skill_premiums = market_intel['skill_premium_analysis']
    for skill, data in list(skill_premiums.items())[:5]:
        print(f"   • {skill}: +{data['premium_percentage']:.1f}% premium ({data['candidate_count']} candidates)")
    
    # Team Templates
    if 'team_templates' in report['team_composition']:
        print(f"\n💼 OPTIMAL TEAM TEMPLATES:")
        templates = report['team_composition']['team_templates']
        for template_name, template_data in list(templates.items())[:3]:
            print(f"   • {template_name.replace('_', ' ').title()}: {template_data['ideal_size']} people")
            print(f"     Avg Score: {template_data['avg_score']:.1f}, Avg Salary: ${template_data['avg_salary']:,.0f}")
    
    # Budget Optimization
    print(f"\n💰 BUDGET OPTIMIZATION:")
    if 'budget_strategies' in report.get('budget_optimization', {}):
        for budget, strategy in list(report['budget_optimization']['budget_strategies'].items())[:2]:
            print(f"   • {budget} Budget: {strategy['team_size']} members")
            print(f"     Quality: {strategy['avg_score']:.1f}/100, Countries: {strategy['countries_represented']}")
    
    # Risk Assessment
    if 'risk_mitigation' in report:
        risks = report['risk_mitigation']
        print(f"\n⚠️  RISK ASSESSMENT:")
        if 'skill_shortage_risks' in risks:
            high_risk_skills = [cat for cat, data in risks['skill_shortage_risks'].items() 
                              if data.get('risk_level') == 'high']
            if high_risk_skills:
                print(f"   • High-Risk Skill Shortages: {', '.join(high_risk_skills)}")
        
        if 'geographic_concentration' in risks:
            geo_risk = risks['geographic_concentration']
            print(f"   • Geographic Concentration: {geo_risk['risk_level']} risk")
    
    # Success Metrics
    if 'success_metrics' in report:
        metrics = report['success_metrics']
        print(f"\n📊 SUCCESS TARGETS:")
        print(f"   • Target Quality Score: {metrics['quality_metrics']['target_avg_score']}/100")
        print(f"   • Target Cost per Hire: ${metrics['budget_metrics']['target_cost_per_hire']:,}")
        print(f"   • Target Timeline: {metrics['timeline_metrics']['target_time_to_hire']}")
    
    print("\n" + "="*70)
    print("✅ Ultra-comprehensive analysis complete!")
    print("📁 Files generated:")
    print("   • comprehensive_hiring_insights.json - Complete analysis")
    print("   • Ready for advanced hiring dashboard integration")
    print("="*70)
    
    return report

if __name__ == "__main__":
    # Generate ultra-comprehensive insights report
    insights_report = generate_hiring_dashboard_insights()