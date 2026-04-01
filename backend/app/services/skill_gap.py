"""
Skill Gap Analysis Service
Compares resume skills against job requirements
"""

from typing import Dict, List


# Job category skill requirements database
JOB_SKILLS_DB = {
    "INFORMATION-TECHNOLOGY": [
        "python", "java", "javascript", "sql", "aws", "docker",
        "kubernetes", "git", "linux", "rest api", "agile", "scrum",
        "machine learning", "cloud", "mongodb", "postgresql"
    ],
    "DATA-SCIENCE": [
        "python", "machine learning", "deep learning", "pandas", "numpy",
        "tensorflow", "pytorch", "sql", "statistics", "nlp", "aws",
        "scikit-learn", "data visualization", "spark"
    ],
    "DESIGNER": [
        "figma", "photoshop", "illustrator", "css", "html",
        "ux", "ui", "wireframing", "prototyping", "sketch",
        "typography", "color theory", "adobe xd"
    ],
    "FINANCE": [
        "accounting", "financial analysis", "excel", "sql",
        "python", "financial modeling", "bloomberg", "risk management",
        "investment", "portfolio management", "taxation"
    ],
    "HEALTHCARE": [
        "patient care", "clinical", "medical", "nursing", "diagnosis",
        "ehr", "hipaa", "pharmacology", "anatomy", "surgery"
    ],
    "HR": [
        "recruitment", "talent acquisition", "onboarding", "payroll",
        "performance management", "employee relations", "hris",
        "communication", "leadership", "conflict resolution"
    ],
    "ENGINEERING": [
        "autocad", "solidworks", "matlab", "project management",
        "problem solving", "python", "c++", "simulation",
        "design", "testing", "manufacturing"
    ],
    "BANKING": [
        "financial analysis", "accounting", "excel", "risk management",
        "compliance", "sql", "customer service", "investment",
        "credit analysis", "communication"
    ],
    "SALES": [
        "communication", "negotiation", "crm", "salesforce",
        "customer service", "leadership", "marketing",
        "business development", "presentation", "teamwork"
    ],
    "TEACHER": [
        "communication", "curriculum development", "classroom management",
        "lesson planning", "assessment", "microsoft office",
        "leadership", "teamwork", "patience", "creativity"
    ],
    "AVIATION": [
        "communication", "teamwork", "safety", "navigation",
        "aircraft systems", "meteorology", "leadership",
        "problem solving", "attention to detail"
    ],
    "CHEF": [
        "cooking", "food safety", "menu planning", "team management",
        "creativity", "time management", "budgeting",
        "food presentation", "hygiene", "leadership"
    ],
    "ACCOUNTANT": [
        "accounting", "taxation", "excel", "tally", "financial reporting",
        "auditing", "sql", "communication", "attention to detail",
        "financial analysis", "compliance"
    ],
    "ADVOCATE": [
        "legal research", "communication", "negotiation", "drafting",
        "litigation", "critical thinking", "problem solving",
        "client management", "documentation"
    ],
    "DIGITAL-MEDIA": [
        "social media", "content creation", "seo", "marketing",
        "photoshop", "video editing", "analytics", "communication",
        "creativity", "copywriting"
    ],
    "CONSULTANT": [
        "problem solving", "communication", "leadership", "project management",
        "excel", "data analysis", "presentation", "strategic thinking",
        "teamwork", "sql"
    ],
    "BUSINESS-DEVELOPMENT": [
        "communication", "negotiation", "crm", "market research",
        "leadership", "strategy", "networking", "sales",
        "presentation", "teamwork"
    ],
    "AGRICULTURE": [
        "farming", "crop management", "soil science", "irrigation",
        "pest control", "leadership", "teamwork",
        "research", "sustainability"
    ],
    "APPAREL": [
        "fashion design", "textile", "pattern making", "sewing",
        "creativity", "cad", "trend analysis", "communication",
        "retail", "merchandising"
    ],
    "ARTS": [
        "creativity", "drawing", "painting", "photography",
        "adobe creative suite", "communication", "portfolio",
        "design", "illustration"
    ],
    "AUTOMOBILE": [
        "mechanical engineering", "autocad", "matlab", "c++",
        "problem solving", "testing", "manufacturing",
        "project management", "teamwork"
    ],
    "BPO": [
        "communication", "customer service", "teamwork", "ms office",
        "problem solving", "data entry", "typing", "crm"
    ],
    "CONSTRUCTION": [
        "autocad", "project management", "safety", "budgeting",
        "leadership", "teamwork", "structural engineering",
        "problem solving", "communication"
    ],
    "FITNESS": [
        "personal training", "nutrition", "exercise science",
        "communication", "motivation", "first aid", "cpr",
        "leadership", "teamwork", "anatomy"
    ],
    "PUBLIC-RELATIONS": [
        "communication", "writing", "media relations", "social media",
        "event management", "crisis management", "creativity",
        "networking", "marketing", "presentation"
    ]
}


class SkillGapAnalyzer:
    """
    Analyzes the gap between resume skills and job requirements.
    """

    def analyze(self, resume_skills: List[str], target_category: str) -> Dict:
        """
        Compare resume skills against job category requirements.
        Returns matched, missing skills and a gap score.
        """
        # Normalize
        resume_skills_lower = [s.lower() for s in resume_skills]

        # Get required skills for category
        required_skills = JOB_SKILLS_DB.get(
            target_category.upper(),
            JOB_SKILLS_DB.get("INFORMATION-TECHNOLOGY")
        )

        # Find matches and gaps
        matched = [s for s in required_skills if s in resume_skills_lower]
        missing = [s for s in required_skills if s not in resume_skills_lower]

        # Calculate scores
        total = len(required_skills)
        match_score = round((len(matched) / total) * 100, 1) if total > 0 else 0
        gap_score = round(100 - match_score, 1)

        return {
            "target_category": target_category,
            "required_skills": required_skills,
            "matched_skills": matched,
            "missing_skills": missing,
            "match_score": match_score,
            "gap_score": gap_score,
            "total_required": total,
            "total_matched": len(matched),
            "total_missing": len(missing)
        }

    def get_improvement_suggestions(self, missing_skills: List[str], category: str) -> List[str]:
        """Generate improvement suggestions based on missing skills."""
        suggestions = []
        for skill in missing_skills[:5]:  # Top 5 missing
            suggestions.append(f"Consider adding '{skill}' to strengthen your {category} profile")
        return suggestions