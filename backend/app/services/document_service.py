from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import vector_store
from app.core.logger import app_logger
from app.database.models import Document, DocumentChunk
from app.rag.pipeline import RAGPipeline
from app.services.document_classifier import DocumentClassifier
from app.services.pdf_service import PDFService


class DocumentService:

    @staticmethod
    async def upload_document(
        file: UploadFile,
        db: Session,
    ) -> Document:
        """
        Upload, classify, index, and persist a PDF document.
        """

        # --------------------------------------------------
        # 1. Validate file type
        # --------------------------------------------------

        if not file.filename:
            raise HTTPException(
                status_code=400,
                detail="A file is required.",
            )

        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are allowed.",
            )

        # --------------------------------------------------
        # 2. Create upload directory
        # --------------------------------------------------

        upload_dir = Path(settings.UPLOAD_DIR)
        upload_dir.mkdir(
            parents=True,
            exist_ok=True,
        )

        # --------------------------------------------------
        # 3. Generate unique filename
        # --------------------------------------------------

        unique_filename = f"{uuid4()}.pdf"
        file_path = upload_dir / unique_filename

        # --------------------------------------------------
        # 4. Read uploaded file
        # --------------------------------------------------

        content = await file.read()

        if not content:
            raise HTTPException(
                status_code=400,
                detail="The uploaded PDF is empty.",
            )

        # --------------------------------------------------
        # 5. Save PDF
        # --------------------------------------------------

        with open(file_path, "wb") as pdf_file:
            pdf_file.write(content)

        try:
            # --------------------------------------------------
            # 6. Read PDF metadata/text
            # --------------------------------------------------

            page_count = PDFService.get_page_count(
                str(file_path)
            )

            pages = PDFService.extract_text(
                str(file_path)
            )

            # --------------------------------------------------
            # 7. Classify document
            # --------------------------------------------------

            document_type = DocumentClassifier.classify(
                pages
            )

            app_logger.info(
                f"Document classified as '{document_type}': "
                f"{file.filename}"
            )

            # --------------------------------------------------
            # 8. Create database document
            # --------------------------------------------------

            document = Document(
                filename=unique_filename,
                original_filename=file.filename,
                total_pages=page_count,
                file_size=len(content),
                status="uploaded",
                document_type=document_type,
            )

            db.add(document)
            db.commit()
            db.refresh(document)

            # --------------------------------------------------
            # 9. Index document using existing RAG pipeline
            # --------------------------------------------------

            pipeline = RAGPipeline()

            chunks = pipeline.index_document(
                str(file_path),
                document_id=document.id,
            )

            # --------------------------------------------------
            # 10. Persist chunks
            # --------------------------------------------------

            for chunk in chunks:
                db.add(
                    DocumentChunk(
                        document_id=document.id,
                        page_number=chunk["page"],
                        chunk_index=chunk["chunk_index"],
                        chunk_text=chunk["text"],
                    )
                )

            db.commit()

            # --------------------------------------------------
            # 11. Persist FAISS index
            # --------------------------------------------------

            vector_dir = Path(settings.VECTOR_DB_DIR)

            vector_dir.mkdir(
                parents=True,
                exist_ok=True,
            )

            vector_store.save(
                document.id,
                str(
                    vector_dir /
                    f"{document.id}.index"
                ),
            )

            # --------------------------------------------------
            # 12. Mark document indexed
            # --------------------------------------------------

            document.status = "indexed"

            db.commit()
            db.refresh(document)

            app_logger.info(
                f"Indexed and persisted "
                f"{len(chunks)} chunks "
                f"for document_id={document.id}."
            )

            return document

        except HTTPException:
            raise

        except Exception as exc:
            app_logger.exception(exc)

            # If the document record was created,
            # mark it as failed.
            if "document" in locals():
                document.status = "failed"
                db.commit()

            raise HTTPException(
                status_code=500,
                detail="Failed to process the uploaded document.",
            )