from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.conversation_schema import (
    ConversationCreate,
    ConversationDetailResponse,
    ConversationMessageCreate,
    ConversationMessageResponse,
    ConversationResponse,
)
from app.services.conversation_service import ConversationService


router = APIRouter(
    prefix="/conversations",
    tags=["Conversations"],
)


@router.post(
    "/",
    response_model=ConversationResponse,
    summary="Create a new conversation",
)
async def create_conversation(
    request: ConversationCreate,
    db: Session = Depends(get_db),
):
    conversation = ConversationService.create_conversation(
        db=db,
        title=request.title,
    )

    return conversation


@router.get(
    "/",
    response_model=list[ConversationResponse],
    summary="Get all conversations",
)
async def get_conversations(
    db: Session = Depends(get_db),
):
    conversations = ConversationService.get_conversations(db)

    return conversations


@router.get(
    "/{conversation_id}",
    response_model=ConversationDetailResponse,
    summary="Get a conversation with messages",
)
async def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
):
    conversation = ConversationService.get_conversation(
        db=db,
        conversation_id=conversation_id,
    )

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found.",
        )

    return conversation


@router.post(
    "/{conversation_id}/messages",
    response_model=ConversationMessageResponse,
    summary="Add a message to a conversation",
)
async def add_message(
    conversation_id: int,
    request: ConversationMessageCreate,
    db: Session = Depends(get_db),
):
    try:
        message = ConversationService.add_message(
            db=db,
            conversation_id=conversation_id,
            sender=request.sender,
            content=request.content,
        )

    except ValueError:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found.",
        )

    return message


@router.patch(
    "/{conversation_id}/title",
    response_model=ConversationResponse,
    summary="Update conversation title",
)
async def update_conversation_title(
    conversation_id: int,
    request: ConversationCreate,
    db: Session = Depends(get_db),
):
    conversation = ConversationService.update_title(
        db=db,
        conversation_id=conversation_id,
        title=request.title,
    )

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found.",
        )

    return conversation


@router.delete(
    "/{conversation_id}",
    summary="Delete a conversation",
)
async def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
):
    deleted = ConversationService.delete_conversation(
        db=db,
        conversation_id=conversation_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found.",
        )

    return {
        "success": True,
        "message": "Conversation deleted successfully.",
    }