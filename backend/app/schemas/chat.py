from typing import Literal

from pydantic import BaseModel


class ChatRequest(BaseModel):
    question: str
    document_id: int | None = None
    mode: Literal["ask", "explain", "summarize"] = "ask"


class ChatResponse(BaseModel):
    answer: str
    sources: list