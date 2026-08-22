import os
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List
from app.models.classifier import ResumeClassifier
from app.services.resume_parser import ResumeParser
from app.services.skill_gap import SkillGapAnalyzer
from app.services.ats_scorer import ATSScorer
from app.services.job_recommender import JobRecommender
from app.services.career_path import CareerPathSuggester
from app.services.database import save_analysis, get_recent_analyses, get_stats, get_all_candidates
from app.nlp.preprocessor import ResumePreprocessor
from app.services.llm_matcher import LLMMatcher

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_DIR = os.path.join(BASE_DIR, "..", "data", "models")

classifier = ResumeClassifier()
parser = ResumeParser()
skill_gap = SkillGapAnalyzer()
ats_scorer = ATSScorer()
job_recommender = JobRecommender()
career_suggester = CareerPathSuggester()
preprocessor = ResumePreprocessor()
llm_matcher = LLMMatcher()

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


class ShortlistInput(BaseModel):
    job_description: str
    candidate_ids: Optional[List[str]] = None


@router.post("/analyze")
async def analyze_resume(resume: ResumeTextInput):
    if not resume.text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty")
    try:
        processed = preprocessor.full_pipeline(resume.text)
        classification = classifier.predict(resume.text)
        predicted_category = classification["category"]
        target_cat = resume.target_category or predicted_category
        gap_analysis = skill_gap.analyze(processed["skills"], target_cat)
        suggestions = skill_gap.get_improvement_suggestions(gap_analysis["missing_skills"], target_cat)
        ats_result = ats_scorer.score(resume.text, processed["skills"], processed["education"], processed["experience_years"] or 0)
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
    if not resume.text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty")
    try:
        processed = preprocessor.full_pipeline(resume.text)
        classification = classifier.predict(resume.text)
        predicted_category = classification["category"]
        target_cat = resume.target_category or predicted_category
        gap_analysis = skill_gap.analyze(processed["skills"], target_cat)
        suggestions = skill_gap.get_improvement_suggestions(gap_analysis["missing_skills"], target_cat)
        ats_result = ats_scorer.score(resume.text, processed["skills"], processed["education"], processed["experience_years"] or 0)
        jobs = await job_recommender.recommend(skills=processed["skills"], category=predicted_category)
        career_path = career_suggester.suggest(category=predicted_category, experience_years=processed["experience_years"] or 0, skills=processed["skills"])

        result_data = {
            "raw_text": resume.text,
            "filename": "Pasted Resume",
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
            "job_recommendations": jobs,
            "career_path": career_path
        }

        try:
            await save_analysis(result_data)
        except Exception:
            pass

        return {"success": True, "data": result_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/jobs/search")
async def search_jobs(job_input: JobSearchInput):
    try:
        jobs = await job_recommender.recommend(
            skills=job_input.skills,
            category=job_input.category,
            location=job_input.location or "",
            salary_min=job_input.salary_min,
            salary_max=job_input.salary_max,
            results=job_input.results or 10
        )
        return {"success": True, "total": len(jobs), "jobs": jobs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
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
        suggestions = skill_gap.get_improvement_suggestions(gap_analysis["missing_skills"], predicted_category)
        ats_result = ats_scorer.score(text, processed["skills"], processed["education"], processed["experience_years"] or 0)
        jobs = await job_recommender.recommend(skills=processed["skills"], category=predicted_category)
        career_path = career_suggester.suggest(category=predicted_category, experience_years=processed["experience_years"] or 0, skills=processed["skills"])

        result_data = {
            "raw_text": text,
            "filename": file.filename,
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
            "job_recommendations": jobs,
            "career_path": career_path
        }

        try:
            await save_analysis(result_data)
        except Exception:
            pass

        return {"success": True, "filename": file.filename, "data": result_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/classify")
def classify_resume(resume: ResumeTextInput):
    if not resume.text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty")
    try:
        result = classifier.predict(resume.text)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/categories")
def get_categories():
    categories = [
        "ACCOUNTANT", "ADVOCATE", "AGRICULTURE", "APPAREL", "ARTS",
        "AUTOMOBILE", "AVIATION", "BANKING", "BPO", "BUSINESS-DEVELOPMENT",
        "CHEF", "CONSTRUCTION", "CONSULTANT", "DESIGNER", "DIGITAL-MEDIA",
        "ENGINEERING", "FINANCE", "FITNESS", "HEALTHCARE", "HR",
        "INFORMATION-TECHNOLOGY", "PUBLIC-RELATIONS", "SALES", "TEACHER"
    ]
    return {"categories": categories, "total": len(categories)}


@router.get("/history")
async def get_history():
    try:
        analyses = await get_recent_analyses(limit=10)
        return {"success": True, "total": len(analyses), "analyses": analyses}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_statistics():
    try:
        stats = await get_stats()
        return {"success": True, "stats": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/shortlist")
async def shortlist_candidates(input_data: ShortlistInput):
    if not input_data.job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty")
    try:
        # Fetch all candidate analyses from database
        all_candidates = await get_all_candidates()
        
        # If candidate_ids is provided, filter them
        if input_data.candidate_ids:
            all_candidates = [c for c in all_candidates if c["_id"] in input_data.candidate_ids]
            
        if not all_candidates:
            return {"success": True, "candidates": []}
            
        results = []
        for candidate in all_candidates:
            # We need raw_text to perform semantic matching
            resume_text = candidate.get("raw_text") or ""
            # If raw text was not saved previously, reconstruct it using their skills and category (fallback)
            if not resume_text:
                resume_text = f"Candidate Profile. Category: {candidate.get('category')}. Skills: {', '.join(candidate.get('skills', []))}."
                
            # Perform match
            match_res = await llm_matcher.match_candidate(resume_text, input_data.job_description)
            
            results.append({
                "id": candidate["_id"],
                "candidate_name": candidate.get("candidate_name") or candidate.get("filename", "Candidate"),
                "filename": candidate.get("filename", "Pasted Resume"),
                "category": candidate.get("category"),
                "ats_score": candidate.get("ats_score", 0),
                "ats_grade": candidate.get("ats_grade", "N/A"),
                "semantic_score": match_res["score"],
                "justification": match_res["justification"],
                "is_llm": match_res["is_llm"],
                "skills": candidate.get("skills", []),
                "experience_years": candidate.get("experience_years", 0),
                "timestamp": candidate.get("timestamp")
            })
            
        # Sort candidates by semantic score in descending order
        results.sort(key=lambda x: x["semantic_score"], reverse=True)
        return {"success": True, "candidates": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/candidates")
async def list_candidates():
    try:
        candidates = await get_all_candidates()
        return {"success": True, "candidates": candidates}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))