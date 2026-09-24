class PromptBuilder:
    """
    Builds prompts for the LLM using retrieved document context.
    """

    @staticmethod
    def build(
        question: str,
        retrieved_chunks: list[dict],
    ) -> str:

        context = ""

        for chunk in retrieved_chunks:
            context += (
                f"Page: {chunk['page']}\n"
                f"{chunk['text']}\n\n"
            )

        prompt = f"""
You are Aureum AI, an AI document assistant.

Answer the user's question using ONLY the provided document context.

If the information is not present in the context, say:

"I couldn't find that information in the uploaded documents."

Mention relevant page numbers when possible.

------------------------
DOCUMENT CONTEXT
------------------------

{context}

------------------------
QUESTION
------------------------

{question}

------------------------
ANSWER
------------------------
"""

        return prompt

    @staticmethod
    def build_document_operation(
        operation: str,
        retrieved_chunks: list[dict],
    ) -> str:

        context = ""

        for chunk in retrieved_chunks:
            context += (
                f"Page {chunk['page']}:\n"
                f"{chunk['text']}\n\n"
            )

        if operation == "explain":
            instruction = """
Explain this document clearly and accurately.

Use ONLY the information contained in the document.

Explain:
- what the document is about
- the main sections or topics
- important concepts
- important facts
- important relationships between ideas

Use simple English where possible.

Do not invent information.
Do not say that information is missing merely because the
document does not contain an answer to a specific question.

Mention page numbers when useful.
"""

        elif operation == "summarize":
            instruction = """
Summarize this document.

Use ONLY the information contained in the document.

Create a useful summary covering:
- the main purpose or topic
- the major sections or topics
- the most important information
- important facts or findings
- important conclusions

Keep the summary organized and concise.

Do not invent information.
Do not treat this as a question-answering task.

Mention page numbers when useful.
"""

        else:
            instruction = """
Describe the important information contained in this document.
Use only the provided document context.
"""

        prompt = f"""
You are Aureum AI, an AI document intelligence assistant.

The user requested a document-level operation.

{instruction}

------------------------
DOCUMENT
------------------------

{context}

------------------------
OUTPUT
------------------------
"""

        return prompt