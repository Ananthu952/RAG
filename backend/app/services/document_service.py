from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logger import app_logger
from app.database.models import Document
from app.rag.pipeline import RAGPipeline
from app.services.pdf_service import PDFService


class DocumentService:

    @staticmethod
    async def upload_document(
        file: UploadFile,
        db: Session,
    ) -> Document:
        """
        Upload and index a PDF document.
        """

        # Validate file type
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are allowed.",
            )

        # Create upload directory
        upload_dir = Path(settings.UPLOAD_DIR)
        upload_dir.mkdir(parents=True, exist_ok=True)

        # Generate unique filename
        unique_filename = f"{uuid4()}.pdf"

        file_path = upload_dir / unique_filename

        # Read uploaded file
        content = await file.read()

        # Save PDF
        with open(file_path, "wb") as pdf_file:
            pdf_file.write(content)

        # Get page count
        page_count = PDFService.get_page_count(str(file_path))

        # Index document using RAG Pipeline
        pipeline = RAGPipeline()

        chunks = pipeline.index_document(str(file_path))

        app_logger.info(
            f"Indexed {len(chunks)} chunks."
        )

        # Save document metadata
        document = Document(
            filename=unique_filename,
            original_filename=file.filename,
            total_pages=page_count,
            file_size=len(content),
            status="uploaded",
        )

        db.add(document)
        db.commit()
        db.refresh(document)

        return document