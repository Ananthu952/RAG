from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.schemas.study_schema import (
    MCQItem,
    MCQRequest,
    MCQResponse,
    ShortNotesResponse,
    StudyRequest,
)
from app.services.study_engine import StudyEngine
from app.services.study_pdf_service import StudyPDFService


router = APIRouter(
    prefix="/study",
    tags=["Study"],
)

study_engine = StudyEngine()


# ==========================================================
# SHORT NOTES
# ==========================================================

@router.post(
    "/short-notes",
    response_model=ShortNotesResponse,
)
async def generate_short_notes(
    request: StudyRequest,
):
    result = study_engine.generate_short_notes(
        document_id=request.document_id
    )

    if not result["content"]:
        raise HTTPException(
            status_code=404,
            detail="Could not generate short notes for this document.",
        )

    return ShortNotesResponse(
        document_id=request.document_id,
        title=result["title"],
        content=result["content"],
        sources=result["sources"],
    )


# ==========================================================
# SHORT NOTES PDF
# ==========================================================

@router.post("/short-notes/pdf")
async def download_short_notes_pdf(
    request: StudyRequest,
):
    result = study_engine.generate_short_notes(
        document_id=request.document_id
    )

    if not result["content"]:
        raise HTTPException(
            status_code=404,
            detail="Could not generate short notes for this document.",
        )

    pdf = StudyPDFService.generate_short_notes_pdf(
        title=result["title"],
        content=result["content"],
    )

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                'attachment; filename="aureum-short-notes.pdf"'
            )
        },
    )


# ==========================================================
# MCQ
# ==========================================================

@router.post(
    "/mcq",
    response_model=MCQResponse,
)
async def generate_mcqs(
    request: MCQRequest,
):
    questions = study_engine.generate_mcqs(
        document_id=request.document_id,
        count=request.count,
        difficulty=request.difficulty,
    )

    if not questions:
        raise HTTPException(
            status_code=404,
            detail="Could not generate MCQs for this document.",
        )

    valid_questions = []

    for question in questions:
        try:
            valid_questions.append(
                MCQItem(
                    question=question["question"],
                    options=question["options"],
                    answer=question["answer"],
                    explanation=question.get(
                        "explanation",
                        "",
                    ),
                    page=question.get("page"),
                )
            )
        except Exception:
            continue

    if not valid_questions:
        raise HTTPException(
            status_code=500,
            detail="The AI generated invalid MCQ data.",
        )

    return MCQResponse(
        document_id=request.document_id,
        title="Generated MCQs",
        questions=valid_questions,
    )


# ==========================================================
# MCQ PDF
# ==========================================================

@router.post("/mcq/pdf")
async def download_mcq_pdf(
    request: MCQRequest,
):
    questions = study_engine.generate_mcqs(
        document_id=request.document_id,
        count=request.count,
        difficulty=request.difficulty,
    )

    if not questions:
        raise HTTPException(
            status_code=404,
            detail="Could not generate MCQs for this document.",
        )

    pdf = StudyPDFService.generate_mcq_pdf(
        title="Aureum Search - MCQ Practice",
        questions=questions,
    )

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                'attachment; filename="aureum-mcqs.pdf"'
            )
        },
    )