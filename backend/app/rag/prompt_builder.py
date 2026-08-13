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
You are an AI Document Assistant.

Rules:

1. Answer ONLY using the provided context.

2. If the answer is not found, reply:

"I couldn't find that information in the uploaded documents."

3. Mention the page number(s) used.

------------------------

Context

{context}

------------------------

Question

{question}

Answer:
"""

        return prompt