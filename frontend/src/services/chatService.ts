import api from "../api/axios";

export type ChatMode =
  | "ask"
  | "explain"
  | "summarize";

export interface ChatSource {
  document_id: number;
  page: number;
  chunk_index: number;
  text: string;
  score: number;
}

export interface ChatResponse {
  answer: string;
  sources: ChatSource[];
}

export async function sendMessage(
  question: string,
  documentId?: number,
  mode: ChatMode = "ask"
): Promise<ChatResponse> {
  const response = await api.post<ChatResponse>(
    "/chat/",
    {
      question,
      document_id: documentId,
      mode,
    }
  );

  return response.data;
}