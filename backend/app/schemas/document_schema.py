from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DocumentResponse(BaseModel):
    id: int
    filename: str
    original_filename: str
    total_pages: int
    file_size: int
    status: str
    upload_time: datetime

    model_config = ConfigDict(from_attributes=True)


class UploadResponse(BaseModel):
    success: bool
    message: str
    document: DocumentResponse