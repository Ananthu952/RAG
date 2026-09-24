from app.rag.llm import LLMService
from app.rag.prompt_builder import PromptBuilder
from app.rag.retriever import Retriever


class ChatEngine:
    """
    Coordinates retrieval and LLM generation.

    Supported modes:

    ask
        Uses semantic retrieval to answer a specific question.

    explain
        Uses the complete indexed document to explain its content.

    summarize
        Uses the complete indexed document to create a summary.
    """

    def __init__(self, vector_store):
        self.retriever = Retriever(vector_store)
        self.llm = LLMService()

    def ask(
        self,
        question: str,
        document_id: int | None = None,
        mode: str = "ask",
    ):
        """
        Process a user request according to the selected mode.
        """

        if mode == "explain":
            return self.explain(document_id)

        if mode == "summarize":
            return self.summarize(document_id)

        return self._ask_question(
            question=question,
            document_id=document_id,
        )

    def _ask_question(
        self,
        question: str,
        document_id: int | None = None,
    ):
        """
        Answer a normal user question using semantic retrieval.
        """

        retrieved_chunks = self.retriever.retrieve(
            question,
            document_id=document_id,
            top_k=5,
        )

        if not retrieved_chunks:
            return {
                "answer": (
                    "I couldn't find that information "
                    "in the uploaded documents."
                ),
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

    def explain(
        self,
        document_id: int | None,
    ):
        """
        Explain the uploaded document.

        Unlike normal question answering, this does NOT perform
        semantic top-k retrieval. It retrieves the complete indexed
        document so the explanation can be based on the document as
        a whole.
        """

        if document_id is None:
            return {
                "answer": "Please upload a document first.",
                "sources": [],
            }

        chunks = self.retriever.retrieve_document(
            document_id
        )

        if not chunks:
            return {
                "answer": "I couldn't find the uploaded document.",
                "sources": [],
            }

        prompt = PromptBuilder.build_document_operation(
            operation="explain",
            retrieved_chunks=chunks,
        )

        answer = self.llm.generate(prompt)

        return {
            "answer": answer,
            "sources": chunks,
        }

    def summarize(
        self,
        document_id: int | None,
    ):
        """
        Summarize the uploaded document.

        Uses the complete indexed document instead of semantic
        question retrieval.
        """

        if document_id is None:
            return {
                "answer": "Please upload a document first.",
                "sources": [],
            }

        chunks = self.retriever.retrieve_document(
            document_id
        )

        if not chunks:
            return {
                "answer": "I couldn't find the uploaded document.",
                "sources": [],
            }

        prompt = PromptBuilder.build_document_operation(
            operation="summarize",
            retrieved_chunks=chunks,
        )

        answer = self.llm.generate(prompt)

        return {
            "answer": answer,
            "sources": chunks,
        }