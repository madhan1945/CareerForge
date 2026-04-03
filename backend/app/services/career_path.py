"""
Career Path Suggestion Service
Provides personalized career roadmap based on current skills and category
"""

from typing import Dict, List


CAREER_PATHS = {
    "INFORMATION-TECHNOLOGY": {
        "junior": {
            "title": "Junior Developer",
            "years": "0-2",
            "skills_needed": ["python", "git", "sql", "html", "css"],
            "next_role": "Mid-level Developer"
        },
        "mid": {
            "title": "Mid-level Developer",
            "years": "2-5",
            "skills_needed": ["docker", "aws", "rest api", "agile", "postgresql"],
            "next_role": "Senior Developer"
        },
        "senior": {
            "title": "Senior Developer",
            "years": "5-8",
            "skills_needed": ["kubernetes", "system design", "mentoring", "ci/cd"],
            "next_role": "Tech Lead / Architect"
        },
        "lead": {
            "title": "Tech Lead / Architect",
            "years": "8+",
            "skills_needed": ["leadership", "architecture", "cloud", "strategic thinking"],
            "next_role": "CTO / VP Engineering"
        }
    },
    "DATA-SCIENCE": {
        "junior": {
            "title": "Junior Data Analyst",
            "years": "0-2",
            "skills_needed": ["python", "sql", "pandas", "excel", "statistics"],
            "next_role": "Data Scientist"
        },
        "mid": {
            "title": "Data Scientist",
            "years": "2-5",
            "skills_needed": ["machine learning", "tensorflow", "scikit-learn", "aws"],
            "next_role": "Senior Data Scientist"
        },
        "senior": {
            "title": "Senior Data Scientist",
            "years": "5-8",
            "skills_needed": ["deep learning", "nlp", "mlops", "leadership"],
            "next_role": "ML Engineer / Data Science Lead"
        },
        "lead": {
            "title": "ML Engineering Lead",
            "years": "8+",
            "skills_needed": ["pytorch", "distributed systems", "team management"],
            "next_role": "Chief Data Officer"
        }
    },
    "FINANCE": {
        "junior": {
            "title": "Financial Analyst",
            "years": "0-2",
            "skills_needed": ["excel", "accounting", "financial modeling", "sql"],
            "next_role": "Senior Financial Analyst"
        },
        "mid": {
            "title": "Senior Financial Analyst",
            "years": "2-5",
            "skills_needed": ["python", "bloomberg", "risk management", "investment"],
            "next_role": "Finance Manager"
        },
        "senior": {
            "title": "Finance Manager",
            "years": "5-8",
            "skills_needed": ["leadership", "strategic planning", "portfolio management"],
            "next_role": "CFO / Finance Director"
        },
        "lead": {
            "title": "CFO / Finance Director",
            "years": "8+",
            "skills_needed": ["executive leadership", "m&a", "board communication"],
            "next_role": "C-Suite Executive"
        }
    },
    "HEALTHCARE": {
        "junior": {
            "title": "Junior Clinician",
            "years": "0-2",
            "skills_needed": ["patient care", "ehr", "clinical documentation"],
            "next_role": "Senior Clinician"
        },
        "mid": {
            "title": "Senior Clinician",
            "years": "2-5",
            "skills_needed": ["diagnosis", "treatment planning", "team coordination"],
            "next_role": "Department Head"
        },
        "senior": {
            "title": "Department Head",
            "years": "5-8",
            "skills_needed": ["leadership", "administration", "budget management"],
            "next_role": "Medical Director"
        },
        "lead": {
            "title": "Medical Director",
            "years": "8+",
            "skills_needed": ["strategic planning", "policy", "executive leadership"],
            "next_role": "Chief Medical Officer"
        }
    }
}

DEFAULT_PATH = {
    "junior": {
        "title": "Entry Level Professional",
        "years": "0-2",
        "skills_needed": ["communication", "teamwork", "problem solving", "ms office"],
        "next_role": "Mid-level Professional"
    },
    "mid": {
        "title": "Mid-level Professional",
        "years": "2-5",
        "skills_needed": ["leadership", "project management", "domain expertise"],
        "next_role": "Senior Professional"
    },
    "senior": {
        "title": "Senior Professional",
        "years": "5-8",
        "skills_needed": ["mentoring", "strategic thinking", "team management"],
        "next_role": "Team Lead / Manager"
    },
    "lead": {
        "title": "Team Lead / Manager",
        "years": "8+",
        "skills_needed": ["executive presence", "organizational leadership", "vision"],
        "next_role": "Director / VP"
    }
}


class CareerPathSuggester:

    def get_current_level(self, experience_years: int) -> str:
        if experience_years < 2:
            return "junior"
        elif experience_years < 5:
            return "mid"
        elif experience_years < 8:
            return "senior"
        else:
            return "lead"

    def suggest(self, category: str, experience_years: int, skills: List[str]) -> Dict:
        experience_years = experience_years or 0
        path = CAREER_PATHS.get(category.upper(), DEFAULT_PATH)
        current_level = self.get_current_level(experience_years)

        levels = ["junior", "mid", "senior", "lead"]
        current_idx = levels.index(current_level)

        current = path.get(current_level, DEFAULT_PATH[current_level])
        next_level = levels[min(current_idx + 1, len(levels) - 1)]
        next_step = path.get(next_level, DEFAULT_PATH[next_level])

        skills_lower = [s.lower() for s in skills]
        skills_to_acquire = [
            s for s in next_step["skills_needed"]
            if s not in skills_lower
        ]

        roadmap = []
        for level in levels:
            step = path.get(level, DEFAULT_PATH[level])
            roadmap.append({
                "level": level,
                "title": step["title"],
                "years": step["years"],
                "is_current": level == current_level,
                "is_completed": levels.index(level) < current_idx
            })

        return {
            "current_role": current["title"],
            "current_level": current_level,
            "next_role": next_step["title"],
            "skills_to_acquire": skills_to_acquire[:5],
            "roadmap": roadmap,
            "estimated_years_to_next": max(0, int(current["years"].split("-")[1]) - experience_years) if "-" in current["years"] else 0
        }