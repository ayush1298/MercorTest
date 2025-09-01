from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from pathlib import Path
import sys
from typing import Optional, List
import json
import numpy as np
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

# Add the script's directory to the Python path
sys.path.append(str(Path(__file__).resolve().parent.parent / 'Scripts'))
try:
    from hiring_insights import HiringInsightsGenerator
except ImportError:
    print("Warning: hiring_insights module not found. Some features will be limited.")
    HiringInsightsGenerator = None

app = FastAPI(title="HiringSight API", description="AI-Powered Hiring Intelligence Platform", version="1.0.0")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
insights_generator = None
df = None

def convert_numpy_types(obj):
    """Recursively convert numpy types to native Python types for JSON serialization"""
    if isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    elif isinstance(obj, (np.integer, np.int64, np.int32)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64, np.float32)):
        return float(obj) if not np.isnan(obj) else None
    elif isinstance(obj, np.bool_):
        return bool(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif pd.isna(obj) or (isinstance(obj, float) and np.isnan(obj)):
        return None
    else:
        return obj

def safe_float(value, default=0.0):
    """Safely convert value to float, handling NaN and None"""
    try:
        if pd.isna(value) or value is None:
            return default
        if isinstance(value, (np.integer, np.floating)):
            if np.isnan(value):
                return default
            return float(value)
        return float(value)
    except (ValueError, TypeError):
        return default

def safe_int(value, default=0):
    """Safely convert value to integer"""
    if pd.isna(value) or value is None:
        return default
    try:
        return int(value)
    except (ValueError, TypeError):
        return default

def safe_str(value, default="Unknown"):
    """Safely convert value to string, handling NaN and None"""
    try:
        if pd.isna(value) or value is None or str(value).lower() == 'nan':
            return default
        return str(value).strip()
    except (ValueError, TypeError):
        return default

def safe_bool(value, default=False):
    """Safely convert value to boolean, handling NaN and None"""
    try:
        if pd.isna(value) or value is None:
            return default
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            return value.lower() in ['true', '1', 'yes']
        return bool(value)
    except (ValueError, TypeError):
        return default

@app.on_event("startup")
def load_data():
    global insights_generator, df
    try:
        csv_path = Path(__file__).resolve().parent.parent / 'engineered_candidates_final.csv'
        print(f"Looking for data at: {csv_path}")
        
        if not csv_path.exists():
            print(f"❌ Data file not found at {csv_path}")
            return
            
        df = pd.read_csv(csv_path)
        
        # Clean and validate data - handle NaN values properly
        print(f"📊 Raw data loaded: {len(df)} rows, {len(df.columns)} columns")
        
        # Replace NaN values in critical columns
        df['name'] = df['name'].fillna('Anonymous Candidate')
        df['email'] = df['email'].fillna('')
        df['overall_score'] = pd.to_numeric(df['overall_score'], errors='coerce').fillna(0)
        df['salary_full_time'] = pd.to_numeric(df['salary_full_time'], errors='coerce').fillna(0)
        df['total_skills'] = pd.to_numeric(df['total_skills'], errors='coerce').fillna(0)
        df['total_experiences'] = pd.to_numeric(df['total_experiences'], errors='coerce').fillna(0)
        
        # Handle string columns
        df['country'] = df['country'].fillna('Unknown')
        df['continent'] = df['continent'].fillna('Unknown')
        df['primary_skill_category'] = df['primary_skill_category'].fillna('general')
        df['experience_level'] = df['experience_level'].fillna('Entry')
        df['timezone_group'] = df['timezone_group'].fillna('Unknown')
        df['original_skills'] = df['original_skills'].fillna('')
        
        # Handle boolean columns
        boolean_columns = ['is_full_stack', 'has_senior_role', 'has_big_tech']
        for col in boolean_columns:
            if col in df.columns:
                df[col] = df[col].fillna(False).astype(bool)
        
        # Remove rows where name is still NaN or empty after filling
        df = df[df['name'].notna() & (df['name'] != '')]
        
        print(f"✅ Data cleaned and loaded: {len(df)} candidates found")
        print(f"Sample columns: {list(df.columns[:10])}")
        
        # Initialize insights generator if available
        if HiringInsightsGenerator:
            insights_generator = HiringInsightsGenerator(str(csv_path))
            print("✅ Insights generator initialized.")
        else:
            print("⚠️ Insights generator not available.")
            
    except Exception as e:
        print(f"❌ Error loading data: {e}")
        import traceback
        traceback.print_exc()
        df = None
        insights_generator = None

# Custom JSON Response class to handle numpy types
class CustomJSONResponse:
    """Custom JSON response that handles numpy types"""
    def __init__(self, content):
        self.content = convert_numpy_types(content)
    
    def __dict__(self):
        return self.content

@app.get("/")
def read_root():
    if df is not None:
        return CustomJSONResponse({
            "message": "🚀 HiringSight API", 
            "version": "1.0.0",
            "status": "ready",
            "total_candidates": len(df),
            "countries": int(df['country'].nunique()),
            "endpoints": [
                "/api/v1/overview",
                "/api/v1/candidates", 
                "/api/v1/insights/comprehensive",
                "/api/v1/analytics/market",
                "/api/v1/filters/options"
            ]
        })
    else:
        return CustomJSONResponse({
            "message": "🚀 HiringSight API", 
            "version": "1.0.0",
            "status": "data_not_loaded",
            "error": "Please check if engineered_candidates_final.csv exists"
        })

@app.get("/api/v1/analytics/market")
def get_market_analytics():
    """Get market intelligence data with salary vs score analysis"""
    if df is None:
        raise HTTPException(status_code=503, detail="Data not available")
    
    try:
        # Get candidates with salary data for salary vs score analysis
        salary_candidates = df[
            (df['salary_full_time'] > 0) & 
            (df['overall_score'] > 0) & 
            df['salary_full_time'].notna() & 
            df['overall_score'].notna()
        ].copy()
        
        # Prepare salary vs score data for frontend
        salary_score_data = []
        for _, row in salary_candidates.head(100).iterrows():  # Limit for performance
            salary_score_data.append({
                'overall_score': safe_float(row['overall_score']),
                'salary_full_time': safe_float(row['salary_full_time']),
                'name': safe_str(row['name']),
                'country': safe_str(row['country']),
                'primary_skill_category': safe_str(row['primary_skill_category'], 'general')
            })
        
        # Skills demand analysis
        skills_demand = {}
        if 'original_skills' in df.columns:
            all_skills = []
            for skills_str in df['original_skills'].dropna():
                skills_str = safe_str(skills_str, '')
                if skills_str:
                    skills = [skill.strip() for skill in skills_str.split(',') if skill.strip()]
                    all_skills.extend(skills)
            
            from collections import Counter
            skill_counts = Counter(all_skills)
            # Get top 20 skills for demand analysis
            skills_demand = dict(skill_counts.most_common(20))
        
        # Country-wise statistics
        country_stats = {}
        if all(col in df.columns for col in ['country', 'overall_score', 'salary_full_time']):
            country_groups = df.groupby('country')
            
            for country, group in country_groups:
                if len(group) >= 3 and country != 'Unknown':
                    avg_score = safe_float(group['overall_score'].mean())
                    salary_data = group[group['salary_full_time'] > 0]['salary_full_time']
                    avg_salary = safe_float(salary_data.mean()) if len(salary_data) > 0 else 0
                    candidate_count = len(group)
                    
                    country_stats[str(country)] = {
                        'avg_score': avg_score,
                        'avg_salary': avg_salary,
                        'candidate_count': candidate_count
                    }
        
        # Skill category distribution
        skill_distribution = {}
        if 'primary_skill_category' in df.columns:
            skill_counts = df['primary_skill_category'].value_counts()
            skill_distribution = {str(k): int(v) for k, v in skill_counts.items() 
                                if k not in ['general', 'Unknown', None]}
        
        # Experience level distribution
        experience_distribution = {}
        if 'experience_level' in df.columns:
            exp_counts = df['experience_level'].value_counts()
            experience_distribution = {str(k): int(v) for k, v in exp_counts.items() 
                                     if k not in ['Unknown', None]}
        
        # Salary ranges
        salary_ranges = {}
        if len(salary_candidates) > 0:
            salary_data = salary_candidates['salary_full_time']
            salary_ranges = {
                "min": safe_float(salary_data.min()),
                "max": safe_float(salary_data.max()),
                "median": safe_float(salary_data.median()),
                "q1": safe_float(salary_data.quantile(0.25)),
                "q3": safe_float(salary_data.quantile(0.75)),
                "mean": safe_float(salary_data.mean())
            }
        
        response_data = {
            "salary_score_data": salary_score_data,
            "high_demand_skills": skills_demand,
            "country_statistics": country_stats,
            "skill_distribution": skill_distribution,
            "experience_distribution": experience_distribution,
            "salary_ranges": salary_ranges,
            "market_insights": {
                "total_countries": len(country_stats),
                "avg_skills_per_candidate": safe_float(df['total_skills'].mean()),
                "big_tech_percentage": safe_float((df['has_big_tech'].sum() / len(df)) * 100) if 'has_big_tech' in df.columns else 0,
                "total_candidates_with_salary": len(salary_candidates)
            }
        }
        
        return CustomJSONResponse(response_data)
        
    except Exception as e:
        print(f"Error in market analytics: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error calculating market data: {str(e)}")

@app.get("/api/v1/insights/comprehensive")
def get_comprehensive_insights():
    """Get comprehensive hiring insights with proper NaN handling"""
    try:
        # Try to load from JSON file first
        insights_path = Path(__file__).resolve().parent.parent / 'comprehensive_hiring_insights.json'
        if insights_path.exists():
            with open(insights_path, 'r', encoding='utf-8') as f:
                insights_data = json.load(f)
            
            # Clean the insights data to remove NaN values
            cleaned_insights = convert_numpy_types(insights_data)
            return CustomJSONResponse(cleaned_insights).content
        
        # Fallback to generated insights if file doesn't exist
        if not insights_generator:
            if df is None:
                raise HTTPException(status_code=503, detail="Data not available")
            
            total_candidates = len(df)
            high_scores = len(df[df['overall_score'] >= 80]) if 'overall_score' in df.columns else 0
            countries = int(df['country'].nunique()) if 'country' in df.columns else 0
            
            fallback_insights = {
                "executive_summary": {
                    "total_candidates_analyzed": total_candidates,
                    "high_value_opportunities": high_scores,
                    "global_talent_reach": countries,
                    "market_opportunity_score": min(85, safe_float((high_scores / total_candidates * 100) if total_candidates > 0 else 0)),
                    "key_recommendation": "Focus on geographic arbitrage and high-value candidates for optimal hiring strategy"
                },
                "actionable_recommendations": {
                    "immediate_actions": [
                        {
                            "action": "Focus on high-scoring candidates",
                            "priority": "HIGH",
                            "description": f"Target the top {high_scores} candidates with scores above 80 for immediate interviews",
                            "timeline": "1-2 weeks"
                        },
                        {
                            "action": "Geographic diversification",
                            "priority": "MEDIUM", 
                            "description": f"Expand search across {countries} available countries to build diverse teams",
                            "timeline": "2-4 weeks"
                        }
                    ]
                }
            }
            return CustomJSONResponse(fallback_insights).content
        
        # Use insights generator
        comprehensive_insights = insights_generator.generate_comprehensive_report()
        cleaned_insights = convert_numpy_types(comprehensive_insights)
        return CustomJSONResponse(cleaned_insights).content
        
    except Exception as e:
        print(f"Error generating insights: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error generating insights: {str(e)}")

@app.get("/api/v1/overview")
def get_overview():
    """Get dashboard overview statistics"""
    if df is None:
        raise HTTPException(status_code=503, detail="Data not available")
    
    try:
        total_candidates = len(df)
        
        # Calculate statistics with safe conversions
        avg_score = safe_float(df['overall_score'].mean())
        countries = int(df['country'].nunique()) if 'country' in df.columns else 0
        
        # High-value candidates (score 80+, salary < 100k)
        high_value_mask = (df['overall_score'] >= 80)
        if 'salary_full_time' in df.columns:
            salary_mask = (df['salary_full_time'] < 100000) | df['salary_full_time'].isna()
            high_value_mask = high_value_mask & salary_mask
        
        high_value_candidates = int(high_value_mask.sum())
        
        # Skill distribution
        skill_distribution = {}
        if 'primary_skill_category' in df.columns:
            skill_counts = df['primary_skill_category'].value_counts()
            skill_distribution = {str(k): int(v) for k, v in skill_counts.head(10).items()}
        
        # Geographic distribution
        geographic_distribution = {}
        if 'continent' in df.columns:
            geo_counts = df['continent'].value_counts()
            geographic_distribution = {str(k): int(v) for k, v in geo_counts.items()}
        
        # Experience distribution
        experience_distribution = {}
        if 'experience_level' in df.columns:
            exp_counts = df['experience_level'].value_counts()
            experience_distribution = {str(k): int(v) for k, v in exp_counts.items()}
        
        return {
            "total_candidates": total_candidates,
            "average_score": avg_score,
            "countries": countries,
            "high_value_candidates": high_value_candidates,
            "skill_distribution": skill_distribution,
            "geographic_distribution": geographic_distribution,
            "experience_distribution": experience_distribution,
            "last_updated": "2024-01-28"
        }
        
    except Exception as e:
        print(f"Error generating overview: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating overview: {str(e)}")

@app.get("/api/v1/candidates")
def get_candidates(
    min_score: float = 0,
    max_score: float = 100,
    min_salary: int = 0,
    max_salary: int = 999999,
    country: str = "",
    skill_category: str = "",
    experience_level: str = "",
    has_big_tech: bool = None,
    search: str = "",
    limit: int = 50,
    offset: int = 0
):
    """Get filtered candidates list"""
    if df is None:
        raise HTTPException(status_code=503, detail="Data not available")
    
    try:
        # Start with all candidates
        filtered_df = df.copy()
        
        # Apply filters
        if min_score > 0:
            filtered_df = filtered_df[filtered_df['overall_score'] >= min_score]
        
        if max_score < 100:
            filtered_df = filtered_df[filtered_df['overall_score'] <= max_score]
        
        if min_salary > 0:
            filtered_df = filtered_df[
                (filtered_df['salary_full_time'] >= min_salary) | 
                (filtered_df['salary_full_time'].isna())
            ]
        
        if max_salary < 999999:
            filtered_df = filtered_df[
                (filtered_df['salary_full_time'] <= max_salary) | 
                (filtered_df['salary_full_time'].isna())
            ]
        
        if country:
            filtered_df = filtered_df[
                filtered_df['country'].str.contains(country, case=False, na=False)
            ]
        
        if skill_category:
            filtered_df = filtered_df[
                filtered_df['primary_skill_category'].str.contains(skill_category, case=False, na=False)
            ]
        
        if experience_level:
            filtered_df = filtered_df[
                filtered_df['experience_level'].str.contains(experience_level, case=False, na=False)
            ]
        
        if has_big_tech is not None:
            filtered_df = filtered_df[filtered_df['has_big_tech'] == has_big_tech]
        
        # Search functionality
        if search:
            search_mask = (
                filtered_df['name'].str.contains(search, case=False, na=False) |
                filtered_df['country'].str.contains(search, case=False, na=False) |
                filtered_df['original_skills'].str.contains(search, case=False, na=False) |
                filtered_df['original_work_experiences'].str.contains(search, case=False, na=False)
            )
            filtered_df = filtered_df[search_mask]
        
        # Sort by overall score (descending)
        filtered_df = filtered_df.sort_values('overall_score', ascending=False)
        
        # Get total count before pagination
        total_filtered = len(filtered_df)
        
        # Apply pagination
        paginated_df = filtered_df.iloc[offset:offset + limit]
        
        # Convert to list of dictionaries with safe type conversion
        candidates = []
        for _, row in paginated_df.iterrows():
            candidate = {
                'id': int(row.name),  # Use index as ID
                'name': safe_str(row['name']),
                'email': safe_str(row['email']),
                'phone': safe_str(row['phone']),
                'country': safe_str(row['country']),
                'city': safe_str(row['city']),
                'continent': safe_str(row['continent']),
                'overall_score': safe_float(row['overall_score']),
                'enhanced_overall_score': safe_float(row.get('enhanced_overall_score', row['overall_score'])),
                'salary_full_time': safe_float(row['salary_full_time']),
                'experience_level': safe_str(row['experience_level']),
                'primary_skill_category': safe_str(row['primary_skill_category']),
                'total_skills': safe_int(row['total_skills']),
                'total_experiences': safe_int(row['total_experiences']),
                'has_big_tech': bool(row.get('has_big_tech', False)),
                'has_senior_role': bool(row.get('has_senior_role', False)),
                'is_full_stack': bool(row.get('is_full_stack', False)),
                'skills_diversity_score': safe_float(row.get('skills_diversity_score', 0)),
                'original_skills': safe_str(row.get('original_skills', '')),
                'original_work_experiences': safe_str(row.get('original_work_experiences', ''))
            }
            candidates.append(candidate)
        
        return {
            "candidates": candidates,
            "total_filtered": total_filtered,
            "total_returned": len(candidates),
            "has_more": (offset + limit) < total_filtered,
            "next_offset": offset + limit if (offset + limit) < total_filtered else None
        }
        
    except Exception as e:
        print(f"Error filtering candidates: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error filtering candidates: {str(e)}")

def get_filter_options():
    """Get available filter options"""
    if df is None:
        raise HTTPException(status_code=503, detail="Data not available")
    
    try:
        options = {
            "countries": sorted([country for country in df['country'].dropna().unique() if country != 'Unknown'])[:50],
            "skill_categories": sorted([cat for cat in df['primary_skill_category'].dropna().unique() if cat != 'general'])[:20],
            "experience_levels": sorted(df['experience_level'].dropna().unique().tolist()),
            "score_range": {
                "min": safe_float(df['overall_score'].min()),
                "max": safe_float(df['overall_score'].max())
            },
            "salary_range": {
                "min": safe_float(df[df['salary_full_time'] > 0]['salary_full_time'].min()) if len(df[df['salary_full_time'] > 0]) > 0 else 0,
                "max": safe_float(df[df['salary_full_time'] > 0]['salary_full_time'].max()) if len(df[df['salary_full_time'] > 0]) > 0 else 200000
            }
        }
        
        return options
        
    except Exception as e:
        print(f"Error getting filter options: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting filter options: {str(e)}")

@app.get("/api/v1/debug/data-sample")
def get_data_sample():
    """Debug endpoint to see sample data"""
    if df is None:
        return {"error": "Data not loaded"}
    
    try:
        # Get sample with safe conversions
        sample_data = []
        for idx, row in df.head(3).iterrows():
            safe_row = {}
            for col, value in row.items():
                if pd.isna(value):
                    safe_row[col] = None
                elif isinstance(value, (np.integer, np.floating)):
                    if np.isnan(value):
                        safe_row[col] = None
                    else:
                        safe_row[col] = float(value) if isinstance(value, np.floating) else int(value)
                else:
                    safe_row[col] = str(value)
            sample_data.append(safe_row)
        
        return {
            "total_rows": len(df),
            "columns": list(df.columns),
            "sample_data": sample_data,
            "data_types": {col: str(dtype) for col, dtype in df.dtypes.items()},
            "null_counts": {col: int(count) for col, count in df.isnull().sum().items()}
        }
    except Exception as e:
        print(f"Error in debug endpoint: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)