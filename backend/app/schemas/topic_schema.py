from pydantic import BaseModel


class DocumentTopic(BaseModel):
    title: str
    description: str | None = None
    pages: list[int] = []


class DocumentTopicsResponse(BaseModel):
    document_id: int
    topics: list[DocumentTopic]