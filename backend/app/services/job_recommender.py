"""
Job Recommendation Service
Fetches real-time jobs from Adzuna API and ranks them by relevance
"""

import httpx
import os
import pathlib
from typing import Dict, List, Optional
from dotenv import load_dotenv

# Load .env from backend directory
env_path = pathlib.Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

ADZUNA_APP_ID = os.getenv("ADZUNA_APP_ID")
ADZUNA_APP_KEY = os.getenv("ADZUNA_APP_KEY")
ADZUNA_COUNTRY = os.getenv("ADZUNA_COUNTRY", "in")
ADZUNA_BASE_URL = f"https://api.adzuna.com/v1/api/jobs/{ADZUNA_COUNTRY}/search"


class JobRecommender:
    """
    Fetches and ranks real-time job listings based on resume skills.
    """

    def build_query(self, skills: List[str], category: str) -> str:
        """Build simple search query from top skill only."""
        if skills:
            return skills[0]
        return category.replace("-", " ")

    async def fetch_jobs(
        self,
        query: str,
        location: str = "",
        results_per_page: int = 10,
        salary_min: Optional[int] = None,
        salary_max: Optional[int] = None
    ) -> List[Dict]:
        """Fetch jobs from Adzuna API."""

        if not ADZUNA_APP_ID or not ADZUNA_APP_KEY:
            return self._mock_jobs(query)

        params = {
            "app_id": ADZUNA_APP_ID,
            "app_key": ADZUNA_APP_KEY,
            "results_per_page": results_per_page,
            "what": query,
            "content-type": "application/json"
        }

        if location:
            params["where"] = location
        if salary_min:
            params["salary_min"] = salary_min
        if salary_max:
            params["salary_max"] = salary_max

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(
                    f"{ADZUNA_BASE_URL}/1",
                    params=params
                )
                print(f"🌐 Adzuna status: {response.status_code}")
                response.raise_for_status()
                data = response.json()
                results = data.get("results", [])
                print(f"📦 Raw results count: {len(results)}")
                return self._parse_jobs(results)
        except Exception as e:
            print(f"⚠️ Adzuna API error: {e}")
            return self._mock_jobs(query)

    def _parse_jobs(self, raw_jobs: List[Dict]) -> List[Dict]:
        """Parse raw Adzuna API response into clean format."""
        jobs = []
        for job in raw_jobs:
            jobs.append({
                "title": job.get("title", "N/A"),
                "company": job.get("company", {}).get("display_name", "N/A"),
                "location": job.get("location", {}).get("display_name", "N/A"),
                "salary_min": job.get("salary_min"),
                "salary_max": job.get("salary_max"),
                "description": job.get("description", "")[:300],
                "apply_url": job.get("redirect_url", ""),
                "created": job.get("created", ""),
                "category": job.get("category", {}).get("label", "N/A")
            })
        return jobs

    def compute_match_score(self, job: Dict, resume_skills: List[str]) -> float:
        """Compute job match score based on skill overlap."""
        if not resume_skills:
            return 0.0
        description = (job.get("description", "") + " " + job.get("title", "")).lower()
        resume_skills_lower = [s.lower() for s in resume_skills]
        matched = sum(1 for skill in resume_skills_lower if skill in description)
        score = round((matched / len(resume_skills_lower)) * 100, 1)
        return score

    def rank_jobs(self, jobs: List[Dict], resume_skills: List[str]) -> List[Dict]:
        """Rank jobs by match score with resume skills."""
        for job in jobs:
            job["match_score"] = self.compute_match_score(job, resume_skills)
        return sorted(jobs, key=lambda x: x["match_score"], reverse=True)

    async def recommend(
        self,
        skills: List[str],
        category: str,
        location: str = "",
        salary_min: Optional[int] = None,
        salary_max: Optional[int] = None,
        results: int = 10
    ) -> List[Dict]:
        """Full pipeline: build query → fetch → rank → return."""
        query = self.build_query(skills, category)
        print(f"🔍 Searching jobs for: {query}")
        jobs = await self.fetch_jobs(
            query=query,
            location=location,
            results_per_page=results,
            salary_min=salary_min,
            salary_max=salary_max
        )
        ranked = self.rank_jobs(jobs, skills)
        return ranked

    def _mock_jobs(self, query: str) -> List[Dict]:
        """Return mock jobs when API keys are not set."""
        return [
            {
                "title": f"Senior {query.title()} Developer",
                "company": "TechCorp India",
                "location": "Bangalore, India",
                "salary_min": 800000,
                "salary_max": 1500000,
                "description": f"Looking for experienced {query} professional.",
                "apply_url": "https://example.com/apply",
                "created": "2024-01-01",
                "category": "IT Jobs",
                "match_score": 75.0
            },
            {
                "title": f"{query.title()} Engineer",
                "company": "Infosys",
                "location": "Hyderabad, India",
                "salary_min": 600000,
                "salary_max": 1200000,
                "description": f"Exciting opportunity for {query} expert.",
                "apply_url": "https://example.com/apply2",
                "created": "2024-01-02",
                "category": "IT Jobs",
                "match_score": 60.0
            }
        ]