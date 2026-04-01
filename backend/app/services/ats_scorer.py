"""
ATS Compatibility Scorer
Scores resume based on ATS optimization criteria
"""

import re
from typing import Dict, List


class ATSScorer:
    """
    Scores a resume for ATS (Applicant Tracking System) compatibility.
    """

    def score(self, raw_text: str, skills: List[str],
              education: List[str], experience_years: int) -> Dict:
        """Calculate ATS compatibility score."""

        scores = {}
        feedback = []

        # 1. Length Score (ideal: 300-800 words)
        word_count = len(raw_text.split())
        if 300 <= word_count <= 800:
            scores["length"] = 100
        elif word_count < 300:
            scores["length"] = 50
            feedback.append("Resume is too short. Aim for 300-800 words.")
        else:
            scores["length"] = 75
            feedback.append("Resume is slightly long. Consider trimming to 800 words.")

        # 2. Skills Score
        skill_count = len(skills)
        if skill_count >= 10:
            scores["skills"] = 100
        elif skill_count >= 5:
            scores["skills"] = 70
            feedback.append("Add more relevant technical skills.")
        else:
            scores["skills"] = 40
            feedback.append("Very few skills detected. Add more skills section.")

        # 3. Education Score
        if education:
            scores["education"] = 100
        else:
            scores["education"] = 50
            feedback.append("Education section not clearly detected.")

        # 4. Experience Score
        if experience_years and experience_years > 0:
            scores["experience"] = 100
        else:
            scores["experience"] = 60
            feedback.append("Years of experience not clearly mentioned.")

        # 5. Contact Info Score
        has_email = bool(re.search(r'\S+@\S+', raw_text))
        has_phone = bool(re.search(r'[\+\(]?[1-9][0-9 .\-\(\)]{8,}[0-9]', raw_text))
        if has_email and has_phone:
            scores["contact"] = 100
        elif has_email or has_phone:
            scores["contact"] = 60
            feedback.append("Add both email and phone number.")
        else:
            scores["contact"] = 20
            feedback.append("No contact information detected.")

        # 6. Keywords density
        keyword_pattern = r'\b(experience|project|developed|managed|led|achieved|improved)\b'
        keyword_count = len(re.findall(keyword_pattern, raw_text.lower()))
        if keyword_count >= 5:
            scores["keywords"] = 100
        elif keyword_count >= 2:
            scores["keywords"] = 70
            feedback.append("Use more action verbs like 'developed', 'managed', 'led'.")
        else:
            scores["keywords"] = 40
            feedback.append("Add strong action verbs to describe your experience.")

        # Calculate overall ATS score
        weights = {
            "length": 0.15,
            "skills": 0.30,
            "education": 0.15,
            "experience": 0.20,
            "contact": 0.10,
            "keywords": 0.10
        }
        overall = sum(scores[k] * weights[k] for k in scores)
        overall = round(overall, 1)

        return {
            "overall_score": overall,
            "breakdown": scores,
            "feedback": feedback,
            "grade": self._get_grade(overall)
        }

    def _get_grade(self, score: float) -> str:
        if score >= 90:
            return "A"
        elif score >= 80:
            return "B"
        elif score >= 70:
            return "C"
        elif score >= 60:
            return "D"
        else:
            return "F"