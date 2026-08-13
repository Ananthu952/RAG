import api from "../api/axios";

export interface ChatResponse {
  answer: string;
  sources: {
    documentName: string;
    page: number;
    score: number;
  }[];
}

export async function sendMessage(
  question: string
): Promise<ChatResponse> {
  const response = await api.post<ChatResponse>("/chat", {
    question,
  });

  return response.data;
}