from sqlalchemy.orm import Session

from app.database.models import Conversation, ConversationMessage


class ConversationService:
    """
    Handles persistent chat conversations and messages.
    """

    @staticmethod
    def create_conversation(
        db: Session,
        title: str = "New Chat",
    ) -> Conversation:
        """
        Create and persist a new conversation.
        """

        conversation = Conversation(
            title=title.strip() or "New Chat",
        )

        db.add(conversation)
        db.commit()
        db.refresh(conversation)

        return conversation

    @staticmethod
    def get_conversations(
        db: Session,
    ) -> list[Conversation]:
        """
        Return all conversations.

        Newest/most recently updated conversations appear first.
        """

        return (
            db.query(Conversation)
            .order_by(
                Conversation.updated_at.desc(),
                Conversation.id.desc(),
            )
            .all()
        )

    @staticmethod
    def get_conversation(
        db: Session,
        conversation_id: int,
    ) -> Conversation | None:
        """
        Get a single conversation with its messages.
        """

        return (
            db.query(Conversation)
            .filter(
                Conversation.id == conversation_id,
            )
            .first()
        )

    @staticmethod
    def add_message(
        db: Session,
        conversation_id: int,
        sender: str,
        content: str,
    ) -> ConversationMessage:
        """
        Add a message to an existing conversation.
        """

        conversation = (
            db.query(Conversation)
            .filter(
                Conversation.id == conversation_id,
            )
            .first()
        )

        if conversation is None:
            raise ValueError("Conversation not found.")

        message = ConversationMessage(
            conversation_id=conversation_id,
            sender=sender,
            content=content,
        )

        db.add(message)

        # Explicitly update the conversation timestamp.
        # This ensures the sidebar ordering changes when a
        # conversation receives a new message.
        from datetime import datetime

        conversation.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(message)

        return message

    @staticmethod
    def update_title(
        db: Session,
        conversation_id: int,
        title: str,
    ) -> Conversation | None:
        """
        Update the title of an existing conversation.
        """

        conversation = (
            db.query(Conversation)
            .filter(
                Conversation.id == conversation_id,
            )
            .first()
        )

        if conversation is None:
            return None

        conversation.title = title.strip() or "New Chat"

        from datetime import datetime

        conversation.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(conversation)

        return conversation

    @staticmethod
    def delete_conversation(
        db: Session,
        conversation_id: int,
    ) -> bool:
        """
        Delete a conversation and its messages.
        """

        conversation = (
            db.query(Conversation)
            .filter(
                Conversation.id == conversation_id,
            )
            .first()
        )

        if conversation is None:
            return False

        db.delete(conversation)
        db.commit()

        return True