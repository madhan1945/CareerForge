"""
Resume Parser Service
Handles PDF and DOCX file parsing
"""

import fitz  # PyMuPDF
import docx
import re
from typing import Optional


class ResumeParser:
    """
    Extracts raw text from PDF and DOCX resume files.
    """

    def extract_text_from_pdf(self, file_bytes: bytes) -> str:
        """Extract text from PDF bytes."""
        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            return text.strip()
        except Exception as e:
            raise ValueError(f"Failed to parse PDF: {str(e)}")

    def extract_text_from_docx(self, file_bytes: bytes) -> str:
        """Extract text from DOCX bytes."""
        try:
            import io
            doc = docx.Document(io.BytesIO(file_bytes))
            text = "\n".join([para.text for para in doc.paragraphs])
            return text.strip()
        except Exception as e:
            raise ValueError(f"Failed to parse DOCX: {str(e)}")

    def extract_text(self, file_bytes: bytes, filename: str) -> str:
        """Auto-detect file type and extract text."""
        filename = filename.lower()
        if filename.endswith(".pdf"):
            return self.extract_text_from_pdf(file_bytes)
        elif filename.endswith(".docx"):
            return self.extract_text_from_docx(file_bytes)
        elif filename.endswith(".txt"):
            return file_bytes.decode("utf-8", errors="ignore")
        else:
            raise ValueError(f"Unsupported file type: {filename}")