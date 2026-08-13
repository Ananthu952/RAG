from langchain_ollama import ChatOllama


class LLMService:
    """
    Handles communication with Ollama.
    """

    def __init__(self):
        self.llm = ChatOllama(
            model="llama3.2:1b",
            temperature=0.2,
        )

    def generate(self, prompt: str) -> str:
        response = self.llm.invoke(prompt)
        return response.content