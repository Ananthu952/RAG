from app.rag.llm import LLMService
from app.rag.retriever import Retriever
from app.core.dependencies import vector_store


class DocumentTopicsService:
    """
    Generates the major topics contained in an indexed document.

    This works for any successfully indexed PDF, regardless of whether
    the document was classified as study or general.
    """

    def __init__(self):
        self.retriever = Retriever(vector_store)
        self.llm = LLMService()

    def generate_topics(
        self,
        document_id: int,
    ) -> list[dict]:
        """
        Retrieve the complete document and ask the LLM to identify
        its major topics.
        """

        chunks = self.retriever.retrieve_document(
            document_id
        )

        if not chunks:
            return []

        context = self._build_context(chunks)

        prompt = f"""
You are Aureum AI, an AI document intelligence assistant.

Analyze the following document and identify its major topics.

Use ONLY the information contained in the document.

Return a JSON array.

Each topic must have exactly these fields:

- title: short topic name
- description: one concise sentence explaining the topic
- pages: list of page numbers where the topic appears

Rules:

1. Identify only meaningful major topics.
2. Do not invent topics that are not present.
3. Do not use outside knowledge.
4. Avoid duplicate or nearly identical topics.
5. Keep topic titles concise.
6. Include the relevant page numbers.
7. Return between 3 and 10 topics when the document contains enough information.
8. If the document is very short, return fewer topics.
9. Return ONLY valid JSON.
10. Do not include markdown code fences.

------------------------
DOCUMENT
------------------------

{context}

------------------------
JSON OUTPUT
------------------------
"""

        response = self.llm.generate(prompt)

        return self._parse_response(response)

    @staticmethod
    def _build_context(
        chunks: list[dict],
    ) -> str:
        """
        Build document context while preserving page information.
        """

        context_parts = []

        for chunk in chunks:
            page = chunk.get("page")
            text = chunk.get("text", "").strip()

            if not text:
                continue

            context_parts.append(
                f"Page {page}:\n{text}"
            )

        return "\n\n".join(context_parts)

    @staticmethod
    def _parse_response(
        response: str,
    ) -> list[dict]:
        """
        Parse the JSON returned by the LLM.

        If the model returns invalid JSON, return an empty list
        instead of crashing the API.
        """

        import json

        if not response:
            return []

        cleaned = response.strip()

        # Remove markdown fences if the model adds them despite
        # being instructed not to.
        if cleaned.startswith("```"):
            lines = cleaned.splitlines()

            if lines and lines[0].startswith("```"):
                lines = lines[1:]

            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]

            cleaned = "\n".join(lines).strip()

        try:
            data = json.loads(cleaned)
        except json.JSONDecodeError:
            return []

        if not isinstance(data, list):
            return []

        topics = []

        for item in data:
            if not isinstance(item, dict):
                continue

            title = item.get("title")
            description = item.get("description")
            pages = item.get("pages", [])

            if not isinstance(title, str) or not title.strip():
                continue

            if not isinstance(description, str):
                description = None

            if not isinstance(pages, list):
                pages = []

            valid_pages = []

            for page in pages:
                try:
                    page_number = int(page)

                    if page_number > 0:
                        valid_pages.append(page_number)

                except (TypeError, ValueError):
                    continue

            topics.append(
                {
                    "title": title.strip(),
                    "description": (
                        description.strip()
                        if description
                        else None
                    ),
                    "pages": sorted(
                        set(valid_pages)
                    ),
                }
            )

        return topics