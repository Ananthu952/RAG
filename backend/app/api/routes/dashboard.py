from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.database.models import Document

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("")
def dashboard(db: Session = Depends(get_db)):

    documents = db.query(Document).all()

    total_documents = len(documents)

    total_pages = sum(
        document.total_pages
        for document in documents
    )

    storage = sum(
        document.file_size
        for document in documents
    )

    recent = sorted(
        documents,
        key=lambda x: x.upload_time,
        reverse=True,
    )[:5]

    recent_uploads = [
        {
            "id": doc.id,
            "original_filename": doc.original_filename,
            "total_pages": doc.total_pages,
            "upload_time": doc.upload_time,
        }
        for doc in recent
    ]

    return {
        "total_documents": total_documents,
        "total_pages": total_pages,
        "total_questions": 0,
        "storage_used": f"{storage / 1024 / 1024:.2f} MB",
        "recent_uploads": recent_uploads,
    }