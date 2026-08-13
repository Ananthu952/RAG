from app.rag.llm import LLMService
from app.rag.prompt_builder import PromptBuilder
from app.rag.retriever import Retriever


class ChatEngine:

    def __init__(self, vector_store):
        self.retriever = Retriever(vector_store)
        self.llm = LLMService()

    def ask(self, question: str):

        retrieved_chunks = self.retriever.retrieve(question)

        if not retrieved_chunks:
            return {
                "answer": "I couldn't find that information in the uploaded documents.",
                "sources": [],
            }

        prompt = PromptBuilder.build(
            question,
            retrieved_chunks,
        )

        answer = self.llm.generate(prompt)

        return {
            "answer": answer,
            "sources": retrieved_chunks,
        }