"""
LLM Semantic Matching & Justification Service
Scores candidates against job descriptions and generates justifications.
"""

import os
import re
import json
import logging
from typing import Dict, List, Optional
import google.generativeai as genai
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Try importing sentence_transformers
try:
    from sentence_transformers import SentenceTransformer, util
    HAS_SENTENCE_TRANSFORMERS = True
except ImportError:
    HAS_SENTENCE_TRANSFORMERS = False
    logger.warning("sentence-transformers is not available. Will use TF-IDF fallback.")

class LLMMatcher:
    def __init__(self):
        # Load API keys from environment
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                logger.info("✅ GenAI configured successfully.")
            except Exception as e:
                logger.error(f"❌ Failed to configure GenAI: {e}")
                self.api_key = None
        else:
            logger.warning("⚠️ No Gemini/Google API Key found. Using local fallback.")
        
        self._embedder = None
        self._embedder_failed = False

    def _get_embedder(self):
        """Lazy load the sentence transformer model to save memory / startup time."""
        if not HAS_SENTENCE_TRANSFORMERS or self._embedder_failed:
            return None
        if self._embedder is None:
            try:
                logger.info("Loading SentenceTransformer model 'all-MiniLM-L6-v2'...")
                self._embedder = SentenceTransformer('all-MiniLM-L6-v2')
                logger.info("✅ SentenceTransformer loaded successfully.")
            except Exception as e:
                logger.error(f"❌ Failed to load SentenceTransformer: {e}")
                self._embedder_failed = True
        return self._embedder

    def calculate_local_semantic_score(self, text1: str, text2: str) -> float:
        """Calculate semantic similarity score locally using SentenceTransformers or TF-IDF."""
        embedder = self._get_embedder()
        if embedder:
            try:
                emb1 = embedder.encode(text1, convert_to_tensor=True)
                emb2 = embedder.encode(text2, convert_to_tensor=True)
                from sentence_transformers.util import cos_sim
                sim = float(cos_sim(emb1, emb2)[0][0])
                # Scale similarity slightly since miniLM scores are naturally compressed (0.1 to 0.8 is standard)
                # Map [0.1, 0.8] to [15, 98]
                if sim < 0.1:
                    score = sim * 150.0
                else:
                    score = 15.0 + ((sim - 0.1) / 0.7) * 83.0
                score = max(0.0, min(100.0, score))
                return round(score, 1)
            except Exception as e:
                logger.error(f"Error in SentenceTransformer encoding: {e}")
        
        # TF-IDF Cosine Similarity Fallback
        try:
            vectorizer = TfidfVectorizer(stop_words='english')
            tfidf = vectorizer.fit_transform([text1, text2])
            sim = float(cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0])
            score = max(0.0, min(100.0, sim * 100.0))
            return round(score, 1)
        except Exception as e:
            logger.error(f"Error in TF-IDF cosine similarity: {e}")
            # Baseline word overlap
            tokens1 = set(re.findall(r'\b\w+\b', text1.lower()))
            tokens2 = set(re.findall(r'\b\w+\b', text2.lower()))
            if not tokens1 or not tokens2:
                return 0.0
            overlap = len(tokens1.intersection(tokens2))
            score = (overlap / min(len(tokens1), len(tokens2))) * 100.0
            return round(score, 1)

    def generate_local_justification(self, resume_text: str, job_desc: str, score: float) -> str:
        """Generate structured justification locally based on keyword/skill match."""
        resume_lower = resume_text.lower()
        job_lower = job_desc.lower()
        
        # List of critical technical/soft skills to search for overlap
        critical_skills = [
            "python", "java", "javascript", "typescript", "c++", "c#", "ruby", "go", "rust",
            "react", "angular", "vue", "node.js", "django", "flask", "fastapi", "html", "css",
            "sql", "nosql", "mongodb", "postgresql", "aws", "azure", "gcp", "docker", "kubernetes",
            "git", "linux", "ci/cd", "machine learning", "deep learning", "nlp", "statistics",
            "agile", "scrum", "project management", "leadership", "communication", "teamwork"
        ]
        
        matched_skills = [skill for skill in critical_skills if skill in resume_lower and skill in job_lower]
        missing_skills = [skill for skill in critical_skills if skill in job_lower and skill not in resume_lower]
        
        if score >= 75:
            justification = f"Strong match ({score}% match). The candidate's background shows direct alignment with key requirements."
            if matched_skills:
                justification += f" Strong expertise shown in: {', '.join(matched_skills[:4])}."
        elif score >= 50:
            justification = f"Moderate match ({score}% match). The candidate has foundational experience matching the description."
            if matched_skills:
                justification += f" Possesses relevant skills in {', '.join(matched_skills[:3])}."
            if missing_skills:
                justification += f" However, key requirements such as {', '.join(missing_skills[:2])} are not explicitly mentioned in the resume."
        else:
            justification = f"Low match ({score}% match). Significant gaps exist between the candidate's profile and the job description."
            if missing_skills:
                justification += f" Gaps identified in essential areas: {', '.join(missing_skills[:3])}."
                
        return justification

    async def match_candidate(self, resume_text: str, job_description: str) -> Dict:
        """Score candidate against job description and provide justification."""
        if not self.api_key:
            score = self.calculate_local_semantic_score(resume_text, job_description)
            justification = self.generate_local_justification(resume_text, job_description, score)
            return {
                "score": score,
                "justification": justification,
                "is_llm": False
            }
            
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            prompt = f"""
You are an expert technical recruiter matching candidate resumes to job descriptions.
Analyze the following resume and job description. Provide:
1. A matching score between 0 and 100 representing how well the candidate fits the requirements (skills, experience, education).
2. A clear, objective justification (2-3 sentences) summarizing their strengths and key skill gaps for this specific role.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Return the output as a raw JSON object with keys "score" (integer) and "justification" (string). Return ONLY the JSON, without markdown formatting or code blocks.
"""
            # Call Gemini
            response = model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Remove potential markdown block wraps
            if response_text.startswith("```json"):
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif response_text.startswith("```"):
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            data = json.loads(response_text)
            return {
                "score": float(data.get("score", 0)),
                "justification": data.get("justification", "No justification provided."),
                "is_llm": True
            }
        except Exception as e:
            logger.error(f"Failed to match candidate using Gemini: {e}. Falling back to local matching.")
            score = self.calculate_local_semantic_score(resume_text, job_description)
            justification = self.generate_local_justification(resume_text, job_description, score)
            return {
                "score": score,
                "justification": justification,
                "is_llm": False
            }
