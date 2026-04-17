"""
MongoDB Database Service
Stores resume analysis history
"""

import motor.motor_asyncio
from datetime import datetime
from typing import List, Dict, Optional
import os
from dotenv import load_dotenv
import pathlib

env_path = pathlib.Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = "careerforge"

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]
collection = db["analyses"]


async def save_analysis(data: Dict) -> str:
    """Save a resume analysis to MongoDB."""
    document = {
        "timestamp": datetime.utcnow(),
        "category": data.get("classification", {}).get("category"),
        "ats_score": data.get("ats_score", {}).get("overall_score"),
        "ats_grade": data.get("ats_score", {}).get("grade"),
        "skills": data.get("parsed_info", {}).get("skills", []),
        "experience_years": data.get("parsed_info", {}).get("experience_years"),
        "word_count": data.get("parsed_info", {}).get("word_count"),
        "skill_gap_score": data.get("skill_gap", {}).get("match_score"),
        "missing_skills": data.get("skill_gap", {}).get("missing_skills", []),
        "improvement_suggestions": data.get("improvement_suggestions", []),
        "job_count": len(data.get("job_recommendations", []))
    }
    result = await collection.insert_one(document)
    return str(result.inserted_id)


async def get_recent_analyses(limit: int = 10) -> List[Dict]:
    """Get recent analyses from MongoDB."""
    cursor = collection.find().sort("timestamp", -1).limit(limit)
    analyses = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        doc["timestamp"] = doc["timestamp"].isoformat()
        analyses.append(doc)
    return analyses


async def get_stats() -> Dict:
    """Get overall statistics from all analyses."""
    total = await collection.count_documents({})
    if total == 0:
        return {"total_analyses": 0}

    pipeline = [
        {
            "$group": {
                "_id": None,
                "avg_ats_score": {"$avg": "$ats_score"},
                "avg_experience": {"$avg": "$experience_years"},
                "total": {"$sum": 1}
            }
        }
    ]
    result = await collection.aggregate(pipeline).to_list(length=1)
    stats = result[0] if result else {}

    cat_pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    top_cats = await collection.aggregate(cat_pipeline).to_list(length=5)

    return {
        "total_analyses": total,
        "avg_ats_score": round(stats.get("avg_ats_score") or 0, 1),
        "avg_experience_years": round(stats.get("avg_experience") or 0, 1),
        "top_categories": [{"category": c["_id"], "count": c["count"]} for c in top_cats]
    }