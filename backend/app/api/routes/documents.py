from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.database.models import Document
from app.schemas.document_schema import UploadResponse
from app.schemas.topic_schema import DocumentTopicsResponse
from app.services.document_service import DocumentService
from app.services.document_topics import DocumentTopicsService


router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


@router.post(
    "/upload",
    response_model=UploadResponse,
    summary="Upload a PDF document",
)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload a PDF document and index it for RAG.
    """

    document = await DocumentService.upload_document(
        file,
        db,
    )

    return UploadResponse(
        success=True,
        message="Document uploaded successfully.",
        document=document,
    )


@router.get(
    "/{document_id}/topics",
    response_model=DocumentTopicsResponse,
    summary="Generate document topics",
)
async def get_document_topics(
    document_id: int,
    db: Session = Depends(get_db),
):
    """
    Generate the major topics contained in an indexed document.
    """

    document = (
        db.query(Document)
        .filter(Document.id == document_id)
        .first()
    )

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    if document.status != "indexed":
        raise HTTPException(
            status_code=400,
            detail="Document is not ready for topic generation.",
        )

    service = DocumentTopicsService()

    topics = service.generate_topics(
        document_id
    )

    return DocumentTopicsResponse(
        document_id=document_id,
        topics=topics,
    )