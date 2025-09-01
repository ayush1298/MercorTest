"""
Comprehensive Feature Engineering Pipeline
Consolidates and enhances features from both clean_data.py and FeatureEngineering.py
"""
import json
import pandas as pd
import numpy as np
from datetime import datetime
import re
from collections import Counter
from scoring_utils import CandidateScorer

# Optional location processing
try:
    from pycountry_convert import country_alpha2_to_continent_code, country_name_to_country_alpha2
    PYCOUNTRY_AVAILABLE = True
except ImportError:
    PYCOUNTRY_AVAILABLE = False

class ComprehensiveFeatureEngineer:
    def __init__(self, json_file_path):
        """Initialize with candidate data from JSON file"""
        with open(json_file_path, 'r') as f:
            self.raw_data = json.load(f)
        
        # Initialize scorer
        self.scorer = CandidateScorer()
        
        print(f"📊 Loaded {len(self.raw_data)} candidates for feature engineering")

    def extract_salary_features(self, annual_salary_expectation):
        """Extract salary features from nested dict"""
        if not annual_salary_expectation:
            return {
                'salary_full_time': 0,
                'salary_part_time': 0,
                'has_salary_info': False,
                'salary_ratio_pt_ft': 0
            }
        
        def clean_salary(salary_str):
            if not salary_str:
                return 0
            if isinstance(salary_str, str):
                numeric = re.sub(r'[^\d]', '', salary_str)
                return int(numeric) if numeric else 0
            return salary_str
        
        full_time = clean_salary(annual_salary_expectation.get('full-time', 0))
        part_time = clean_salary(annual_salary_expectation.get('part-time', 0))
        
        return {
            'salary_full_time': full_time,
            'salary_part_time': part_time,
            'has_salary_info': full_time > 0 or part_time > 0,
            'salary_ratio_pt_ft': part_time / full_time if full_time > 0 else 0
        }

    def extract_work_availability_features(self, work_availability):
        """Extract work availability features from list"""
        if not work_availability:
            return {
                'available_full_time': False,
                'available_part_time': False,
                'availability_flexibility': 0,
                'both_available': False
            }
        
        # Convert to list if it's not already
        if not isinstance(work_availability, list):
            work_availability = [work_availability] if work_availability else []
        
        full_time = 'full-time' in work_availability
        part_time = 'part-time' in work_availability
        
        return {
            'available_full_time': full_time,
            'available_part_time': part_time,
            'availability_flexibility': len(work_availability),
            'both_available': full_time and part_time
        }

    def extract_work_experience_features(self, work_experiences):
        """Extract comprehensive work experience features"""
        if not work_experiences or len(work_experiences) == 0:
            return {
                'total_experiences': 0,
                'unique_companies': 0,
                'has_big_tech': False,
                'has_senior_role': False,
                'has_lead_role': False,
                'most_common_role_type': 'None',
                'experience_diversity_score': 0,
                'company_prestige_score': 0,
                'avg_prestige_per_role': 0
            }
        
        companies = [exp.get('company', '') for exp in work_experiences if isinstance(exp, dict)]
        roles = [exp.get('roleName', '') for exp in work_experiences if isinstance(exp, dict)]
        
        # Extract features
        unique_companies = len(set(companies))
        has_big_tech = any(any(tech in company for tech in self.scorer.big_tech_companies) for company in companies)
        has_senior_role = any(any(keyword in role for keyword in self.scorer.senior_keywords) for role in roles)
        has_lead_role = any(any(keyword in role for keyword in ['Lead', 'Manager', 'Director', 'VP', 'CTO']) for role in roles)
        
        # Role type analysis
        role_types = []
        for role in roles:
            role_lower = role.lower()
            if 'engineer' in role_lower or 'developer' in role_lower:
                role_types.append('Engineering')
            elif 'manager' in role_lower or 'lead' in role_lower:
                role_types.append('Management')
            elif 'analyst' in role_lower or 'data' in role_lower:
                role_types.append('Analytics')
            elif 'researcher' in role_lower:
                role_types.append('Research')
            else:
                role_types.append('Other')
        
        most_common_role = Counter(role_types).most_common(1)[0][0] if role_types else 'None'
        
        # Company prestige scoring
        prestige_score = 0
        for company in companies:
            if any(tech in company for tech in self.scorer.big_tech_companies):
                prestige_score += 10
            elif 'University' in company or 'Institute' in company:
                prestige_score += 5
            else:
                prestige_score += 1
        
        return {
            'total_experiences': len(work_experiences),
            'unique_companies': unique_companies,
            'has_big_tech': has_big_tech,
            'has_senior_role': has_senior_role,
            'has_lead_role': has_lead_role,
            'most_common_role_type': most_common_role,
            'experience_diversity_score': unique_companies / len(work_experiences) if work_experiences else 0,
            'company_prestige_score': prestige_score,
            'avg_prestige_per_role': prestige_score / len(work_experiences) if work_experiences else 0
        }

    def extract_education_features(self, education):
        """Extract education features from nested dict"""
        if not education:
            return {
                'highest_education_level': 'None',
                'total_degrees': 0,
                'has_cs_degree': False,
                'has_top_school': False,
                'has_high_gpa': False
            }
        
        highest_level = education.get('highest_level', '')
        degrees = education.get('degrees', [])
        
        if not degrees or not isinstance(degrees, list):
            return {
                'highest_education_level': highest_level,
                'total_degrees': 0,
                'has_cs_degree': False,
                'has_top_school': False,
                'has_high_gpa': False
            }
        
        # CS/Tech related subjects
        tech_subjects = ['Computer Science', 'Information Technology', 'Software', 'Data Science', 'Machine Learning']
        
        has_cs_degree = any(
            any(subject in degree.get('subject', '') for subject in tech_subjects)
            for degree in degrees if isinstance(degree, dict)
        )
        
        has_top_school = any(
            degree.get('isTop50', False) or degree.get('isTop25', False) 
            for degree in degrees if isinstance(degree, dict)
        )
        
        has_high_gpa = any(
            'GPA 3.5-3.9' in degree.get('gpa', '') or 'GPA 4.0' in degree.get('gpa', '') or 
            'Summa Cum Laude' in degree.get('gpa', '') or 'Cum Laude' in degree.get('gpa', '')
            for degree in degrees if isinstance(degree, dict)
        )
        
        return {
            'highest_education_level': highest_level,
            'total_degrees': len(degrees),
            'has_cs_degree': has_cs_degree,
            'has_top_school': has_top_school,
            'has_high_gpa': has_high_gpa
        }

    def extract_skills_features(self, skills):
        """Extract comprehensive skills features"""
        if not skills or len(skills) == 0:
            return {
                'total_skills': 0,
                'frontend_skills': 0,
                'backend_skills': 0,
                'mobile_skills': 0,
                'data_skills': 0,
                'cloud_skills': 0,
                'database_skills': 0,
                'devops_skills': 0,
                'language_skills': 0,
                'is_full_stack': False,
                'high_demand_skills': 0,
                'skills_diversity_score': 0,
                'primary_skill_category': 'None'
            }
        
        # Convert to list if not already
        if not isinstance(skills, list):
            skills = [skills] if skills else []
        
        # Count skills per category
        category_counts = {}
        for category, category_skills in self.scorer.skill_categories.items():
            count = sum(1 for skill in skills if skill in category_skills)
            category_counts[category] = count
        
        high_demand_count = sum(1 for skill in skills if skill in self.scorer.high_demand_skills)
        
        # Determine primary category
        primary_category = max(category_counts, key=category_counts.get) if any(category_counts.values()) else 'None'
        
        # Full-stack determination
        is_full_stack = category_counts['frontend'] > 0 and category_counts['backend'] > 0
        
        # Diversity score
        categories_with_skills = sum(1 for count in category_counts.values() if count > 0)
        diversity_score = categories_with_skills / len(self.scorer.skill_categories)
        
        return {
            'total_skills': len(skills),
            'frontend_skills': category_counts['frontend'],
            'backend_skills': category_counts['backend'],
            'mobile_skills': category_counts['mobile'],
            'data_skills': category_counts['data'],
            'cloud_skills': category_counts['cloud'],
            'database_skills': category_counts['database'],
            'devops_skills': category_counts['devops'],
            'language_skills': category_counts['languages'],
            'is_full_stack': is_full_stack,
            'high_demand_skills': high_demand_count,
            'skills_diversity_score': diversity_score,
            'primary_skill_category': primary_category
        }

    def extract_location_features(self, location):
        """Extract location and geographic diversity features using your enhanced approach"""
        if not location:
            return {
                'country': 'Unknown',
                'city': 'Unknown',
                'continent': 'Unknown',
                'timezone_group': 'Unknown',
                'is_major_tech_hub': False
            }
        
        # Extract country (usually last part after comma)
        location_parts = location.split(',')
        country = location_parts[-1].strip() if location_parts else location
        city = location_parts[0].strip() if len(location_parts) > 1 else location
        
        # Fallback mappings
        continent_mapping = {
            'United States': 'North America', 'Canada': 'North America', 'Mexico': 'North America',
            'Brazil': 'South America', 'Argentina': 'South America', 'Peru': 'South America',
            'Germany': 'Europe', 'Spain': 'Europe', 'United Kingdom': 'Europe', 'France': 'Europe',
            'India': 'Asia', 'Pakistan': 'Asia', 'Bangladesh': 'Asia', 'China': 'Asia',
            'Australia': 'Oceania', 'Egypt': 'Africa'
        }
        
        timezone_mapping = {
            'United States': 'Americas', 'Canada': 'Americas', 'Brazil': 'Americas', 'Argentina': 'Americas',
            'Germany': 'Europe', 'Spain': 'Europe', 'United Kingdom': 'Europe',
            'India': 'Asia', 'Pakistan': 'Asia', 'Bangladesh': 'Asia', 'China': 'Asia',
            'Australia': 'Asia-Pacific'
        }
        
        continent = 'Unknown'
        timezone_group = 'Unknown'

        # Use pycountry_convert if available, otherwise fallback
        if PYCOUNTRY_AVAILABLE:
            try:
                country_code = country_name_to_country_alpha2(country)
                continent_code = country_alpha2_to_continent_code(country_code)
                continent_names = {
                    'NA': 'North America', 'SA': 'South America', 'AS': 'Asia',
                    'OC': 'Oceania', 'EU': 'Europe', 'AF': 'Africa'
                }
                continent = continent_names.get(continent_code, 'Other')

                # Simplified timezone grouping based on continent
                timezone_map = {
                    'North America': 'Americas',
                    'South America': 'Americas',
                    'Europe': 'Europe/Africa',
                    'Africa': 'Europe/Africa',
                    'Asia': 'Asia',
                    'Oceania': 'Asia-Pacific'
                }
                timezone_group = timezone_map.get(continent, 'Other')

            except (KeyError, Exception):
                # Fallback for countries not found in the library
                continent = continent_mapping.get(country, 'Other')
                timezone_group = timezone_mapping.get(country, 'Other')
        else:
            # Use fallback mappings
            continent = continent_mapping.get(country, 'Other')
            timezone_group = timezone_mapping.get(country, 'Other')
        
        # Major tech hubs
        tech_hubs = ['San Francisco', 'New York', 'Seattle', 'Austin', 'Boston', 'Toronto', 'Berlin', 'London', 'Bangalore', 'Sydney']
        is_tech_hub = any(hub.lower() in location.lower() for hub in tech_hubs)
        
        return {
            'country': country,
            'city': city,
            'continent': continent,
            'timezone_group': timezone_group,
            'is_major_tech_hub': is_tech_hub
        }

    def engineer_all_features(self):
        """Main function to engineer all features with dual scoring"""
        engineered_data = []
        
        print("🔧 Engineering features for all candidates...")
        
        for i, candidate in enumerate(self.raw_data):
            try:
                # Extract basic info
                basic_features = {
                    'candidate_id': i,
                    'name': candidate.get('name', ''),
                    'email': candidate.get('email', ''),
                    'phone': candidate.get('phone', ''),
                    'submitted_at': candidate.get('submitted_at', '')
                }
                
                # Extract complex features
                salary_features = self.extract_salary_features(candidate.get('annual_salary_expectation'))
                availability_features = self.extract_work_availability_features(candidate.get('work_availability'))
                experience_features = self.extract_work_experience_features(candidate.get('work_experiences'))
                education_features = self.extract_education_features(candidate.get('education'))
                skills_features = self.extract_skills_features(candidate.get('skills'))
                location_features = self.extract_location_features(candidate.get('location'))
                
                # Calculate scores using both basic and detailed methods
                basic_experience_score = self.scorer.calculate_experience_score_basic(candidate.get('work_experiences', []))
                detailed_experience_score = self.scorer.calculate_experience_score_detailed(candidate.get('work_experiences', []))
                
                basic_skills_score, basic_skills_metrics = self.scorer.calculate_skills_score_basic(candidate.get('skills', []))
                detailed_skills_score, detailed_skills_metrics = self.scorer.calculate_skills_score_detailed(candidate.get('skills', []))
                
                basic_education_score, basic_education_metrics = self.scorer.calculate_education_score_basic(candidate.get('education', {}))
                detailed_education_score, detailed_education_metrics = self.scorer.calculate_education_score_detailed(candidate.get('education', {}))
                
                market_value_score = self.scorer.calculate_market_value_score(
                    candidate.get('annual_salary_expectation', {}),
                    candidate.get('location', ''),
                    detailed_experience_score
                )
                
                completeness_score = self.scorer.calculate_profile_completeness_score(candidate)
                
                # Combine all features
                all_features = {
                    **basic_features,
                    **salary_features,
                    **availability_features,
                    **experience_features,
                    **education_features,
                    **skills_features,
                    **location_features
                }
                
                # Add scoring results
                all_features.update({
                    # Basic scoring (0-100 scale)
                    'experience_score': basic_experience_score,
                    'skills_score': basic_skills_score,
                    'education_score': basic_education_score,
                    'market_value_score': market_value_score,
                    'completeness_score': completeness_score,
                    
                    # Detailed scoring (0-162 scale)
                    'detailed_experience_score': detailed_experience_score,
                    'detailed_skills_score': detailed_skills_score,
                    'detailed_education_score': detailed_education_score,
                })
                
                # Add detailed metrics
                if detailed_skills_metrics:
                    all_features.update({
                        'detailed_skill_categories': detailed_skills_metrics.get('categories', []),
                        'detailed_is_full_stack': detailed_skills_metrics.get('is_full_stack', False),
                        'detailed_high_demand_count': detailed_skills_metrics.get('high_demand_skills', 0),
                    })
                
                if detailed_education_metrics:
                    all_features.update({
                        'detailed_has_tech_degree': detailed_education_metrics.get('has_tech_degree', False),
                        'detailed_top50_schools': detailed_education_metrics.get('top50_schools', 0),
                        'detailed_top25_schools': detailed_education_metrics.get('top25_schools', 0),
                    })
                
                # Calculate overall scores
                all_features['overall_score'] = self.scorer.calculate_overall_score_basic(all_features)
                all_features['enhanced_overall_score'] = self.scorer.calculate_overall_score_enhanced(all_features)
                
                # Add experience level categorization
                all_features['experience_level'] = self.scorer.get_experience_level_category(basic_experience_score, use_enhanced=False)
                all_features['enhanced_experience_level'] = self.scorer.get_experience_level_category(detailed_experience_score, use_enhanced=True)
                
                # Add original nested data for reference
                all_features['original_skills'] = candidate.get('skills', [])
                all_features['original_work_experiences'] = candidate.get('work_experiences', [])
                
                engineered_data.append(all_features)
                
            except Exception as e:
                print(f"❌ Error processing candidate {i}: {e}")
                continue
        
        print(f"✅ Successfully engineered features for {len(engineered_data)} candidates")
        return pd.DataFrame(engineered_data)

    def create_team_selection_features(self, df):
        """Create additional features for team selection"""
        print("🎯 Creating team selection features...")
        
        # Percentile rankings
        df['score_percentile'] = df['overall_score'].rank(pct=True) * 100
        df['enhanced_score_percentile'] = df['enhanced_overall_score'].rank(pct=True) * 100
        df['salary_percentile'] = df['salary_full_time'].rank(pct=True) * 100
        df['experience_percentile'] = df['company_prestige_score'].rank(pct=True) * 100
        
        # Value categories
        df['value_tier'] = pd.cut(
            df['overall_score'], 
            bins=[0, 50, 70, 85, 100], 
            labels=['Low', 'Medium', 'High', 'Excellent']
        )
        
        df['enhanced_value_tier'] = pd.cut(
            df['enhanced_overall_score'], 
            bins=[0, 80, 110, 140, 162], 
            labels=['Low', 'Medium', 'High', 'Excellent']
        )
        
        df['experience_tier'] = pd.cut(
            df['total_experiences'],
            bins=[-1, 0, 2, 5, 20],
            labels=['Entry', 'Junior', 'Mid', 'Senior']
        )
        
        # Budget categories
        df['budget_category'] = pd.cut(
            df['salary_full_time'],
            bins=[0, 60000, 100000, 140000, 300000],
            labels=['Budget', 'Standard', 'Premium', 'Executive']
        )
        
        # Value for money ratio
        df['value_for_money'] = df['overall_score'] / (df['salary_full_time'] / 1000).replace(0, np.inf)
        df['enhanced_value_for_money'] = df['enhanced_overall_score'] / (df['salary_full_time'] / 1000).replace(0, np.inf)
        
        print("✅ Team selection features created successfully")
        return df

    def generate_summary_statistics(self, df):
        """Generate comprehensive summary statistics"""
        summary = {
            'dataset_summary': {
                'total_candidates': len(df),
                'avg_overall_score': round(df['overall_score'].mean(), 2),
                'avg_enhanced_score': round(df['enhanced_overall_score'].mean(), 2),
                'score_std': round(df['overall_score'].std(), 2),
                'countries_represented': len(df['country'].unique()),
                'avg_salary': round(df['salary_full_time'].mean(), 2),
                'median_salary': round(df['salary_full_time'].median(), 2)
            },
            'score_distribution': {
                'basic_scoring': {
                    'top_10_percent': len(df[df['score_percentile'] >= 90]),
                    'top_25_percent': len(df[df['score_percentile'] >= 75]),
                    'top_50_percent': len(df[df['score_percentile'] >= 50])
                },
                'enhanced_scoring': {
                    'top_10_percent': len(df[df['enhanced_score_percentile'] >= 90]),
                    'top_25_percent': len(df[df['enhanced_score_percentile'] >= 75]),
                    'top_50_percent': len(df[df['enhanced_score_percentile'] >= 50])
                }
            },
            'geographic_distribution': df['country'].value_counts().head(10).to_dict(),
            'experience_distribution': df['experience_level'].value_counts().to_dict(),
            'skill_category_distribution': df['primary_skill_category'].value_counts().to_dict(),
            'salary_statistics': {
                'by_experience': df.groupby('experience_level')['salary_full_time'].mean().to_dict(),
                'by_country': df.groupby('country')['salary_full_time'].mean().head(10).to_dict()
            },
            'top_skills': self._get_top_skills(df)
        }
        
        return summary

    def _get_top_skills(self, df):
        """Extract top skills from the dataset"""
        all_skills = []
        for skills_list in df['original_skills'].dropna():
            if isinstance(skills_list, list):
                all_skills.extend(skills_list)
            elif isinstance(skills_list, str) and skills_list != '[]':
                try:
                    skills = eval(skills_list)
                    if isinstance(skills, list):
                        all_skills.extend(skills)
                except:
                    continue
        
        return Counter(all_skills).most_common(20)

    def save_results(self, df, base_filename='engineered_candidates'):
        """Save all results to files"""
        print("💾 Saving results...")
        
        # Save main CSV
        csv_path = f'{base_filename}.csv'
        df_save = df.copy()
        
        # Convert lists to strings for CSV compatibility
        df_save['original_skills'] = df_save['original_skills'].apply(
            lambda x: ', '.join(x) if isinstance(x, list) else str(x)
        )
        df_save['original_work_experiences'] = df_save['original_work_experiences'].apply(
            lambda x: '; '.join([f"{exp.get('company', '')}: {exp.get('roleName', '')}" 
                               for exp in x if isinstance(exp, dict)]) if isinstance(x, list) else str(x)
        )
        
        df_save.to_csv(csv_path, index=False)
        print(f"✅ Main dataset saved to {csv_path}")
        
        # Save summary
        summary = self.generate_summary_statistics(df)
        summary_path = f'{base_filename}_summary.json'
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=2, default=str)
        print(f"✅ Summary statistics saved to {summary_path}")
        
        return df_save, summary

def main():
    """Main execution function"""
    print("🚀 Starting Comprehensive Feature Engineering Pipeline...")
    print("="*60)
    
    # Initialize feature engineer
    engineer = ComprehensiveFeatureEngineer('form-submissions.json')
    
    # Engineer all features
    df_engineered = engineer.engineer_all_features()
    
    # Add team selection features
    df_final = engineer.create_team_selection_features(df_engineered)
    
    # Save results
    df_saved, summary = engineer.save_results(df_final, 'engineered_candidates_final')
    
    # Display key results
    print("\n" + "="*60)
    print("📊 FEATURE ENGINEERING COMPLETE - KEY INSIGHTS")
    print("="*60)
    
    print(f"\n📈 DATASET OVERVIEW:")
    print(f"   • Total candidates processed: {summary['dataset_summary']['total_candidates']:,}")
    print(f"   • Countries represented: {summary['dataset_summary']['countries_represented']}")
    print(f"   • Average score (basic): {summary['dataset_summary']['avg_overall_score']}/100")
    print(f"   • Average score (enhanced): {summary['dataset_summary']['avg_enhanced_score']}/162")
    
    print(f"\n🏆 TOP PERFORMERS:")
    top_candidates = df_final.nlargest(5, 'enhanced_overall_score')
    for i, (_, candidate) in enumerate(top_candidates.iterrows(), 1):
        print(f"   {i}. {candidate['name']} - Enhanced Score: {candidate['enhanced_overall_score']:.1f}, "
              f"Country: {candidate['country']}, Skills: {candidate['primary_skill_category']}")
    
    print(f"\n🌍 GEOGRAPHIC DIVERSITY:")
    for country, count in list(summary['geographic_distribution'].items())[:5]:
        print(f"   • {country}: {count} candidates")
    
    print(f"\n🛠️ SKILL CATEGORIES:")
    for category, count in list(summary['skill_category_distribution'].items())[:5]:
        print(f"   • {category}: {count} candidates")
    
    print(f"\n💰 SALARY INSIGHTS:")
    print(f"   • Average salary: ${summary['dataset_summary']['avg_salary']:,.0f}")
    print(f"   • Median salary: ${summary['dataset_summary']['median_salary']:,.0f}")
    
    print("\n" + "="*60)
    print("✅ Ready for hiring dashboard development!")
    print("📁 Files created:")
    print("   • engineered_candidates_final.csv - Main dataset")
    print("   • engineered_candidates_final_summary.json - Summary statistics")
    print("="*60)
    
    return df_final, summary

if __name__ == "__main__":
    df_final, summary = main()