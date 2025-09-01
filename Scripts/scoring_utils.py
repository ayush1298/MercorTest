"""
Scoring utilities for candidate evaluation
Contains all scoring algorithms and metrics calculation functions
"""
import pandas as pd
import numpy as np
import re
from collections import Counter

class CandidateScorer:
    def __init__(self):
        # Define skill categories
        self.skill_categories = {
            'frontend': ['React', 'Angular', 'Vue JS', 'HTML/CSS', 'JavaScript', 'TypeScript', 'Bootstrap', 'Next JS'],
            'backend': ['Node JS', 'Django', 'Flask', 'Express', 'FastAPI', 'Spring Boot', 'Laravel', 'PHP'],
            'mobile': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Android', 'iOS'],
            'data': ['Machine Learning', 'Data Analysis', 'Pandas', 'Tensorflow', 'Pytorch', 'Computer Vision', 'NLP'],
            'database': ['SQL', 'PostgreSQL', 'MongoDB', 'NoSQL', 'Redis', 'MySQL'],
            'cloud': ['Amazon Web Services', 'Azure', 'Google Cloud Platform', 'Docker', 'Kubernetes'],
            'devops': ['Jenkins', 'Terraform', 'Ansible', 'CI/CD', 'Docker', 'Kubernetes'],
            'languages': ['Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C#', 'Go', 'Rust']
        }
        
        self.high_demand_skills = [
            'React', 'JavaScript', 'Python', 'Node JS', 'TypeScript', 'Java', 
            'Machine Learning', 'SQL', 'Amazon Web Services', 'Docker'
        ]
        
        self.big_tech_companies = [
            'Google', 'Amazon', 'Microsoft', 'Apple', 'Meta', 'Netflix', 
            'Tesla', 'Uber', 'Airbnb', 'Spotify', 'Stripe'
        ]
        
        self.senior_keywords = [
            'Senior', 'Lead', 'Principal', 'Staff', 'Director', 'VP', 
            'CTO', 'Co-Founder', 'Head of', 'Chief'
        ]

    def calculate_experience_score_basic(self, work_experiences):
        """Basic experience scoring (0-25 points)"""
        if not work_experiences:
            return 0
        
        score = 0
        exp_count = len(work_experiences)
        score += min(exp_count * 8, 25)  # Max 25 points for experience count
        
        return score

    def calculate_experience_score_detailed(self, work_experiences):
        """Detailed experience scoring (0-50 points)"""
        if not work_experiences or len(work_experiences) == 0:
            return 0
        
        score = 0
        
        # Base score for number of experiences (0-20 points)
        exp_count = len(work_experiences)
        score += min(exp_count * 4, 20)
        
        # Seniority bonus (0-15 points)
        for exp in work_experiences:
            if isinstance(exp, dict):
                role = exp.get('roleName', '')
                if any(keyword in role for keyword in self.senior_keywords):
                    score += 5
                    break  # Only count once
        
        # Big tech bonus (0-15 points)
        for exp in work_experiences:
            if isinstance(exp, dict):
                company = exp.get('company', '')
                if any(tech_comp in company for tech_comp in self.big_tech_companies):
                    score += 10
                    break  # Only count once
        
        return min(score, 50)

    def calculate_skills_score_basic(self, skills):
        """Basic skills scoring (0-30 points)"""
        if not skills:
            return 0, {}
        
        score = 0
        
        # Base score for skill count (0-20 points)
        skill_count = len(skills)
        score += min(skill_count * 2, 20)
        
        # High-demand skills bonus (0-10 points)
        high_demand_count = sum(1 for skill in skills if skill in self.high_demand_skills)
        score += min(high_demand_count * 2, 10)
        
        skills_metrics = {
            'total_skills': skill_count,
            'high_demand_skills': high_demand_count,
            'categories': [],
            'is_full_stack': False
        }
        
        return min(score, 30), skills_metrics

    def calculate_skills_score_detailed(self, skills):
        """Detailed skills scoring (0-40 points)"""
        if not skills or len(skills) == 0:
            return 0, {}
        
        score = 0
        
        # Convert to list if not already
        if not isinstance(skills, list):
            skills = [skills] if skills else []
        
        # Count skills per category
        category_counts = {}
        for category, category_skills in self.skill_categories.items():
            count = sum(1 for skill in skills if skill in category_skills)
            category_counts[category] = count
        
        # Base score for skill count (0-15 points)
        skill_count = len(skills)
        score += min(skill_count * 1, 15)
        
        # High-demand skills bonus (0-15 points)
        high_demand_count = sum(1 for skill in skills if skill in self.high_demand_skills)
        score += min(high_demand_count * 3, 15)
        
        # Skill diversity bonus (0-10 points)
        categories_with_skills = sum(1 for count in category_counts.values() if count > 0)
        diversity_score = categories_with_skills / len(self.skill_categories)
        score += diversity_score * 10
        
        # Full-stack determination
        is_full_stack = category_counts['frontend'] > 0 and category_counts['backend'] > 0
        
        skills_metrics = {
            'total_skills': skill_count,
            'high_demand_skills': high_demand_count,
            'skill_categories_covered': categories_with_skills,
            'categories': [cat for cat, count in category_counts.items() if count > 0],
            'is_full_stack': is_full_stack,
            'skills_diversity_score': diversity_score
        }
        
        return min(score, 40), skills_metrics

    def calculate_education_score_basic(self, education):
        """Basic education scoring (0-20 points)"""
        if not education:
            return 0, {}
        
        highest_level = education.get('highest_level', '')
        
        level_scores = {
            'Doctorate': 20,
            "Master's Degree": 15,
            "Bachelor's Degree": 10,
            "Associate's Degree": 5,
            'High School Diploma': 2
        }
        
        score = level_scores.get(highest_level, 0)
        
        education_metrics = {
            'highest_level': highest_level,
            'total_degrees': 0,
            'has_tech_degree': False,
            'has_top_school': False
        }
        
        return score, education_metrics

    def calculate_education_score_detailed(self, education):
        """Detailed education scoring (0-40 points)"""
        if not education or not education.get('degrees'):
            return 0, {}
        
        score = 0
        highest_level = education.get('highest_level', '')
        degrees = education.get('degrees', [])
        
        # Base score for degree level (0-25 points)
        level_scores = {
            'Doctorate': 25,
            "Master's Degree": 20,
            "Bachelor's Degree": 15,
            "Associate's Degree": 10,
            'High School Diploma': 5
        }
        score += level_scores.get(highest_level, 0)
        
        if not degrees or not isinstance(degrees, list):
            education_metrics = {
                'highest_level': highest_level,
                'total_degrees': 0,
                'has_tech_degree': False,
                'has_top_school': False,
                'top50_schools': 0,
                'top25_schools': 0
            }
            return score, education_metrics
        
        # School ranking bonus (0-10 points)
        top50_count = sum(1 for degree in degrees if isinstance(degree, dict) and degree.get('isTop50', False))
        top25_count = sum(1 for degree in degrees if isinstance(degree, dict) and degree.get('isTop25', False))
        
        if top25_count > 0:
            score += 10
        elif top50_count > 0:
            score += 5
        
        # Tech degree bonus (0-5 points)
        tech_subjects = ['Computer Science', 'Information Technology', 'Software', 'Data Science', 'Machine Learning']
        has_tech_degree = any(
            any(subject in degree.get('subject', '') for subject in tech_subjects)
            for degree in degrees if isinstance(degree, dict)
        )
        if has_tech_degree:
            score += 5
        
        education_metrics = {
            'highest_level': highest_level,
            'total_degrees': len(degrees),
            'has_tech_degree': has_tech_degree,
            'has_top_school': top50_count > 0 or top25_count > 0,
            'top50_schools': top50_count,
            'top25_schools': top25_count
        }
        
        return min(score, 40), education_metrics

    def calculate_market_value_score(self, salary_expectation, location, experience_score):
        """Calculate market value score based on salary expectations (0-20 points)"""
        if not salary_expectation:
            return 0
        
        def extract_salary_numeric(salary_str):
            if not salary_str:
                return 0
            if isinstance(salary_str, str):
                numeric = re.sub(r'[^\d]', '', salary_str)
                return int(numeric) if numeric else 0
            return salary_str
        
        full_time_salary = extract_salary_numeric(salary_expectation.get('full-time', 0))
        
        if full_time_salary == 0:
            return 0
        
        # Location-based salary adjustments
        location_multipliers = {
            'United States': 1.0, 'Canada': 0.8, 'Germany': 0.9, 'United Kingdom': 0.9,
            'Australia': 0.8, 'India': 0.3, 'Brazil': 0.4, 'Mexico': 0.5,
            'Argentina': 0.4, 'Pakistan': 0.2, 'Bangladesh': 0.2
        }
        
        # Get country from location
        country = location.split(',')[-1].strip() if location else 'Other'
        multiplier = location_multipliers.get(country, 0.5)
        
        adjusted_salary = full_time_salary * multiplier
        
        # Score based on value for money (lower salary = higher score for budget efficiency)
        if adjusted_salary < 50000:
            return 20
        elif adjusted_salary < 80000:
            return 15
        elif adjusted_salary < 120000:
            return 10
        else:
            return 5

    def calculate_profile_completeness_score(self, candidate):
        """Calculate profile completeness score (0-12 points)"""
        required_fields = ['name', 'email', 'skills', 'work_experiences', 'education']
        optional_fields = ['phone', 'location']
        
        score = 0
        
        # Required fields (2 points each)
        for field in required_fields:
            value = candidate.get(field)
            if value:
                if field == 'skills' and isinstance(value, list) and len(value) > 0:
                    score += 2
                elif field in ['work_experiences', 'education'] and value:
                    score += 2
                elif field in ['name', 'email'] and isinstance(value, str) and value.strip():
                    score += 2
        
        # Optional fields (1 point each)
        for field in optional_fields:
            if candidate.get(field):
                score += 1
        
        return score

    def calculate_overall_score_basic(self, candidate_features):
        """Calculate basic overall score (0-100 points)"""
        score = 0
        
        # Experience (25 points max)
        score += candidate_features.get('experience_score', 0)
        
        # Skills (30 points max)
        score += candidate_features.get('skills_score', 0)
        
        # Education (20 points max)
        score += candidate_features.get('education_score', 0)
        
        # Market value (15 points max)
        score += candidate_features.get('market_value_score', 0)
        
        # Profile completeness (10 points max - scaled from 12)
        completeness = candidate_features.get('completeness_score', 0)
        score += min(completeness * (10/12), 10)
        
        return min(score, 100)

    def calculate_overall_score_enhanced(self, candidate_features):
        """Calculate enhanced overall score (0-162 points)"""
        score = 0
        
        # Enhanced Experience (50 points max)
        score += candidate_features.get('detailed_experience_score', 0)
        
        # Enhanced Skills (40 points max)
        score += candidate_features.get('detailed_skills_score', 0)
        
        # Enhanced Education (40 points max)
        score += candidate_features.get('detailed_education_score', 0)
        
        # Market value (20 points max)
        score += candidate_features.get('market_value_score', 0)
        
        # Profile completeness (12 points max)
        score += candidate_features.get('completeness_score', 0)
        
        return min(score, 162)

    def get_experience_level_category(self, experience_score, use_enhanced=False):
        """Categorize experience level based on score"""
        if use_enhanced:
            # Enhanced scoring thresholds (0-50)
            if experience_score >= 40:
                return 'Senior'
            elif experience_score >= 25:
                return 'Mid-Level'
            elif experience_score >= 10:
                return 'Junior'
            else:
                return 'Entry-Level'
        else:
            # Basic scoring thresholds (0-25)
            if experience_score >= 20:
                return 'Senior'
            elif experience_score >= 15:
                return 'Mid-Level'
            elif experience_score >= 8:
                return 'Junior'
            else:
                return 'Entry-Level'

    def get_primary_skill_category(self, skills):
        """Get the primary skill category for a candidate"""
        if not skills:
            return 'None'
        
        category_counts = {}
        for category, category_skills in self.skill_categories.items():
            count = sum(1 for skill in skills if skill in category_skills)
            if count > 0:
                category_counts[category] = count
        
        if not category_counts:
            return 'Other'
        
        return max(category_counts, key=category_counts.get)