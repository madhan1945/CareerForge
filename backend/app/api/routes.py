"""
CareerForge API Routes
"""

import os
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional
from app.models.classifier import ResumeClassifier
from app.services.resume_parser import ResumeParser
from app.services.skill_gap import SkillGapAnalyzer
from app.services.ats_scorer import ATSScorer
from app.services.job_recommender import JobRecommender
from app.nlp.preprocessor import ResumePreprocessor

router = APIRouter()

# Fix model path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_DIR = os.path.join(BASE_DIR, "..", "data", "models")

# Initialize services
classifier = ResumeClassifier()
parser = ResumeParser()
skill_gap = SkillGapAnalyzer()
ats_scorer = ATSScorer()
job_recommender = JobRecommender()
preprocessor = ResumePreprocessor()

try:
    classifier.load(model_dir=MODEL_DIR)
    print("✅ Model loaded successfully")
except Exception as e:
    print(f"⚠️ Model not loaded: {e}")


class ResumeTextInput(BaseModel):
    text: str
    target_category: Optional[str] = None


class JobSearchInput(BaseModel):
    skills: list
    category: str
    location: Optional[str] = ""
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    results: Optional[int] = 10


@router.post("/analyze")
async def analyze_resume(resume: ResumeTextInput):
    """Full resume analysis - classify, parse, ATS score, skill gap."""
    if not resume.text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty")
    try:
        processed = preprocessor.full_pipeline(resume.text)
        classification = classifier.predict(resume.text)
        predicted_category = classification["category"]
        target_cat = resume.target_category or predicted_category
        gap_analysis = skill_gap.analyze(processed["skills"], target_cat)
        suggestions = skill_gap.get_improvement_suggestions(
            gap_analysis["missing_skills"], target_cat
        )
        ats_result = ats_scorer.score(
            resume.text,
            processed["skills"],
            processed["education"],
            processed["experience_years"] or 0
        )
        return {
            "success": True,
            "data": {
                "classification": classification,
                "parsed_info": {
                    "skills": processed["skills"],
                    "education": processed["education"],
                    "experience_years": processed["experience_years"],
                    "word_count": processed["word_count"],
                    "entities": processed["entities"]
                },
                "ats_score": ats_result,
                "skill_gap": gap_analysis,
                "improvement_suggestions": suggestions
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-and-recommend")
async def analyze_and_recommend(resume: ResumeTextInput):
    """Full resume analysis + real-time job recommendations."""
    if not resume.text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty")
    try:
        processed = preprocessor.full_pipeline(resume.text)
        classification = classifier.predict(resume.text)
        predicted_category = classification["category"]
        target_cat = resume.target_category or predicted_category
        gap_analysis = skill_gap.analyze(processed["skills"], target_cat)
        suggestions = skill_gap.get_improvement_suggestions(
            gap_analysis["missing_skills"], target_cat
        )
        ats_result = ats_scorer.score(
            resume.text,
            processed["skills"],
            processed["education"],
            processed["experience_years"] or 0
        )
        # Fetch real-time jobs
        jobs = await job_recommender.recommend(
            skills=processed["skills"],
            category=predicted_category
        )
        return {
            "success": True,
            "data": {
                "classification": classification,
                "parsed_info": {
                    "skills": processed["skills"],
                    "education": processed["education"],
                    "experience_years": processed["experience_years"],
                    "word_count": processed["word_count"],
                    "entities": processed["entities"]
                },
                "ats_score": ats_result,
                "skill_gap": gap_analysis,
                "improvement_suggestions": suggestions,
                "job_recommendations": jobs
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/jobs/search")
async def search_jobs(job_input: JobSearchInput):
    """Search for jobs based on skills and category."""
    try:
        jobs = await job_recommender.recommend(
            skills=job_input.skills,
            category=job_input.category,
            location=job_input.location or "",
            salary_min=job_input.salary_min,
            salary_max=job_input.salary_max,
            results=job_input.results or 10
        )
        return {
            "success": True,
            "total": len(jobs),
            "jobs": jobs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    """Upload PDF or DOCX resume file and analyze it."""
    allowed = [".pdf", ".docx", ".txt"]
    if not any(file.filename.lower().endswith(ext) for ext in allowed):
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, TXT files allowed")
    try:
        file_bytes = await file.read()
        text = parser.extract_text(file_bytes, file.filename)
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from file")
        processed = preprocessor.full_pipeline(text)
        classification = classifier.predict(text)
        predicted_category = classification["category"]
        gap_analysis = skill_gap.analyze(processed["skills"], predicted_category)
        suggestions = skill_gap.get_improvement_suggestions(
            gap_analysis["missing_skills"], predicted_category
        )
        ats_result = ats_scorer.score(
            text,
            processed["skills"],
            processed["education"],
            processed["experience_years"] or 0
        )
        jobs = await job_recommender.recommend(
            skills=processed["skills"],
            category=predicted_category
        )
        return {
            "success": True,
            "filename": file.filename,
            "data": {
                "classification": classification,
                "parsed_info": {
                    "skills": processed["skills"],
                    "education": processed["education"],
                    "experience_years": processed["experience_years"],
                    "word_count": processed["word_count"],
                    "entities": processed["entities"]
                },
                "ats_score": ats_result,
                "skill_gap": gap_analysis,
                "improvement_suggestions": suggestions,
                "job_recommendations": jobs
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/classify")
def classify_resume(resume: ResumeTextInput):
    """Classify a resume into a job category."""
    if not resume.text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty")
    try:
        result = classifier.predict(resume.text)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/categories")
def get_categories():
    """Get all available job categories."""
    categories = [
        'ACCOUNTANT', 'ADVOCATE', 'AGRICULTURE', 'APPAREL', 'ARTS',
        'AUTOMOBILE', 'AVIATION', 'BANKING', 'BPO', 'BUSINESS-DEVELOPMENT',
        'CHEF', 'CONSTRUCTION', 'CONSULTANT', 'DESIGNER', 'DIGITAL-MEDIA',
        'ENGINEERING', 'FINANCE', 'FITNESS', 'HEALTHCARE', 'HR',
        'INFORMATION-TECHNOLOGY', 'PUBLIC-RELATIONS', 'SALES', 'TEACHER'
    ]
    return {"categories": categories, "total": len(categories)}