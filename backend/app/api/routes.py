"""
CareerForge API Routes
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.models.classifier import ResumeClassifier

router = APIRouter()

# Load model once at startup
classifier = ResumeClassifier()
try:
    classifier.load(model_dir="../../data/models")
    print("✅ Model loaded successfully")
except Exception as e:
    print(f"⚠️ Model not loaded: {e}")


class ResumeInput(BaseModel):
    text: str


@router.post("/classify")
def classify_resume(resume: ResumeInput):
    """Classify a resume into a job category."""
    if not resume.text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty")
    try:
        result = classifier.predict(resume.text)
        return {
            "success": True,
            "data": result
        }
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