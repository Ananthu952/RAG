from typing import Literal

from pydantic import BaseModel, Field


# ============================================================
# Common
# ============================================================

class StudyRequest(BaseModel):
    document_id: int = Field(..., gt=0)


# ============================================================
# Short Notes
# ============================================================

class ShortNotesResponse(BaseModel):
    document_id: int
    title: str
    content: str
    sources: list


# ============================================================
# MCQ
# ============================================================

class MCQRequest(BaseModel):
    document_id: int = Field(..., gt=0)

    count: int = Field(
        default=10,
        ge=1,
        le=50,
    )

    difficulty: Literal[
        "easy",
        "medium",
        "hard",
    ] = "medium"


class MCQItem(BaseModel):
    question: str

    options: list[str] = Field(
        ...,
        min_length=4,
        max_length=4,
    )

    answer: str

    explanation: str

    page: int | None = None


class MCQResponse(BaseModel):
    document_id: int

    title: str

    questions: list[MCQItem]