
import os

from langchain_ollama import ChatOllama


class LLMService:
    """
    Supports Ollama for local development
    and Gemini for cloud deployment.
    """

    def __init__(self):
        provider = os.getenv("LLM_PROVIDER", "ollama").lower()

        if provider == "gemini":
            from langchain_google_genai import ChatGoogleGenerativeAI

            api_key = os.getenv("GEMINI_API_KEY")

            if not api_key:
                raise ValueError("GEMINI_API_KEY is not configured")

            self.llm = ChatGoogleGenerativeAI(
                model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
                temperature=0.2,
                google_api_key=api_key,
            )

        else:
            self.llm = ChatOllama(
                model="llama3.2:1b",
                temperature=0.2,
            )

    def generate(self, prompt: str) -> str:
        response = self.llm.invoke(prompt)
        return response.content
