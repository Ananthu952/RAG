from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.document_schema import UploadResponse
from app.services.document_service import DocumentService

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
    Upload a PDF document and save its metadata.
    """
    document = await DocumentService.upload_document(file, db)

    return UploadResponse(
        success=True,
        message="Document uploaded successfully.",
        document=document,
    )