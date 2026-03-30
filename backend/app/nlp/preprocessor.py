"""
Resume Text Preprocessing Pipeline
Handles cleaning, normalization, and feature extraction
"""

import re
import nltk
import spacy
from typing import Dict, List, Optional

nltk.download('stopwords', quiet=True)
nltk.download('punkt', quiet=True)
nltk.download('wordnet', quiet=True)

from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

nlp = spacy.load("en_core_web_sm")

STOP_WORDS = set(stopwords.words('english'))
LEMMATIZER = WordNetLemmatizer()


class ResumePreprocessor:

    def __init__(self):
        self.nlp = nlp

    def clean_text(self, text: str) -> str:
        text = re.sub(r'http\S+|www\S+', '', text)
        text = re.sub(r'\S+@\S+', '', text)
        text = re.sub(r'[\+\(]?[1-9][0-9 .\-\(\)]{8,}[0-9]', '', text)
        text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def normalize_text(self, text: str) -> str:
        text = text.lower()
        tokens = text.split()
        tokens = [t for t in tokens if t not in STOP_WORDS and len(t) > 2]
        tokens = [LEMMATIZER.lemmatize(t) for t in tokens]
        return ' '.join(tokens)

    def extract_entities(self, text: str) -> Dict[str, List[str]]:
        doc = self.nlp(text[:5000])
        entities = {
            "organizations": [],
            "locations": [],
            "persons": [],
            "dates": []
        }
        for ent in doc.ents:
            if ent.label_ == "ORG":
                entities["organizations"].append(ent.text)
            elif ent.label_ in ("GPE", "LOC"):
                entities["locations"].append(ent.text)
            elif ent.label_ == "PERSON":
                entities["persons"].append(ent.text)
            elif ent.label_ == "DATE":
                entities["dates"].append(ent.text)
        return {k: list(set(v)) for k, v in entities.items()}

    def extract_skills(self, text: str) -> List[str]:
        SKILLS_DB = [
            "python", "java", "javascript", "typescript", "c++", "c#", "ruby",
            "go", "rust", "kotlin", "swift", "scala", "r", "matlab", "php",
            "react", "angular", "vue", "node.js", "django", "flask", "fastapi",
            "html", "css", "rest api", "graphql",
            "machine learning", "deep learning", "nlp", "computer vision",
            "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy",
            "spark", "hadoop", "sql", "nosql", "mongodb", "postgresql",
            "aws", "azure", "gcp", "docker", "kubernetes", "ci/cd", "jenkins",
            "terraform", "git", "linux",
            "leadership", "communication", "teamwork", "problem solving",
            "project management", "agile", "scrum"
        ]
        text_lower = text.lower()
        found_skills = []
        for skill in SKILLS_DB:
            if skill in text_lower:
                found_skills.append(skill)
        return found_skills

    def extract_education(self, text: str) -> List[str]:
        education_patterns = [
            r'(b\.?tech|bachelor|b\.?e\.?|b\.?sc|b\.?a\.?)',
            r'(m\.?tech|master|m\.?e\.?|m\.?sc|m\.?b\.?a\.?)',
            r'(ph\.?d|doctorate)',
            r'(10th|12th|high school|secondary)',
            r'(university|college|institute|iit|nit|bits)'
        ]
        education = []
        for pattern in education_patterns:
            matches = re.findall(pattern, text.lower())
            education.extend(matches)
        return list(set(education))

    def extract_experience_years(self, text: str) -> Optional[int]:
        patterns = [
            r'(\d+)\+?\s*years?\s*(?:of\s*)?experience',
            r'experience\s*(?:of\s*)?(\d+)\+?\s*years?',
        ]
        for pattern in patterns:
            match = re.search(pattern, text.lower())
            if match:
                return int(match.group(1))
        return None

    def full_pipeline(self, raw_text: str) -> Dict:
        cleaned = self.clean_text(raw_text)
        normalized = self.normalize_text(cleaned)
        entities = self.extract_entities(cleaned)
        skills = self.extract_skills(cleaned)
        education = self.extract_education(cleaned)
        experience = self.extract_experience_years(cleaned)

        return {
            "raw_text": raw_text,
            "cleaned_text": cleaned,
            "normalized_text": normalized,
            "skills": skills,
            "education": education,
            "experience_years": experience,
            "entities": entities,
            "word_count": len(cleaned.split()),
            "char_count": len(cleaned)
        }