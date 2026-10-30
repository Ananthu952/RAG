import api from "../api/axios";

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  id: number;
  conversation_id: number;
  sender: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ConversationDetail extends Conversation {
  messages: ConversationMessage[];
}

export interface CreateConversationRequest {
  title?: string;
}

export interface AddMessageRequest {
  sender: "user" | "assistant";
  content: string;
}

/**
 * Create a new conversation.
 */
export async function createConversation(
  title = "New Chat"
): Promise<Conversation> {
  const response = await api.post<Conversation>(
    "/conversations/",
    {
      title,
    }
  );

  return response.data;
}

/**
 * Get all saved conversations.
 */
export async function getConversations(): Promise<Conversation[]> {
  const response = await api.get<Conversation[]>(
    "/conversations/"
  );

  return response.data;
}

/**
 * Get one conversation including its messages.
 */
export async function getConversation(
  conversationId: number
): Promise<ConversationDetail> {
  const response = await api.get<ConversationDetail>(
    `/conversations/${conversationId}`
  );

  return response.data;
}

/**
 * Save a user or assistant message.
 */
export async function addConversationMessage(
  conversationId: number,
  sender: "user" | "assistant",
  content: string
): Promise<ConversationMessage> {
  const response = await api.post<ConversationMessage>(
    `/conversations/${conversationId}/messages`,
    {
      sender,
      content,
    }
  );

  return response.data;
}

/**
 * Update conversation title.
 */
export async function updateConversationTitle(
  conversationId: number,
  title: string
): Promise<Conversation> {
  const response = await api.patch<Conversation>(
    `/conversations/${conversationId}/title`,
    {
      title,
    }
  );

  return response.data;
}

/**
 * Delete a conversation.
 */
export async function deleteConversation(
  conversationId: number
): Promise<void> {
  await api.delete(
    `/conversations/${conversationId}`
  );
}