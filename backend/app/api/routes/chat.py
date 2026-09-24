from fastapi import APIRouter

from app.core.dependencies import vector_store
from app.rag.chat_engine import ChatEngine
from app.schemas.chat import ChatRequest, ChatResponse


router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)


chat_engine = ChatEngine(vector_store)


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):

    result = chat_engine.ask(
        request.question,
        document_id=request.document_id,
        mode=request.mode,
    )

    return result