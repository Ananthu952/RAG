from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ConversationMessageCreate(BaseModel):
    """
    Data required to save a chat message.
    """

    sender: str
    content: str


class ConversationMessageResponse(BaseModel):
    """
    Message returned to the frontend.
    """

    id: int
    conversation_id: int
    sender: str
    content: str
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class ConversationCreate(BaseModel):
    """
    Data required to create a new conversation.
    """

    title: str = "New Chat"


class ConversationResponse(BaseModel):
    """
    Conversation returned to the frontend.
    """

    id: int
    title: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class ConversationDetailResponse(BaseModel):
    """
    Conversation with its complete message history.
    """

    id: int
    title: str
    created_at: datetime
    updated_at: datetime
    messages: list[ConversationMessageResponse]

    model_config = ConfigDict(
        from_attributes=True
    )