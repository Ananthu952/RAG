import api from "../api/axios";

export async function sendMessage(question: string) {
  const response = await api.post("/chat", {
    question,
  });

  return response.data;
}