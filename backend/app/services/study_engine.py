import json
import re

from app.core.dependencies import vector_store
from app.core.logger import app_logger
from app.rag.llm import LLMService
from app.rag.retriever import Retriever


class StudyEngine:
    def __init__(self):
        self.retriever = Retriever(vector_store)
        self.llm = LLMService()

    def generate_short_notes(self, document_id: int) -> dict:
        chunks = self.retriever.retrieve_document(document_id)

        if not chunks:
            return {
                "title": "Short Notes",
                "content": "",
                "sources": [],
            }

        context = self._build_context(chunks)

        prompt = f"""
You are a study assistant.

Create concise study notes ONLY from the document content below.

Rules:
- Do not use outside knowledge.
- Do not invent facts.
- Organize the notes with headings and bullet points.
- Keep important definitions, concepts, processes, and facts.
- Make the notes useful for exam preparation.
- Return Markdown only.

DOCUMENT:
{context}
"""

        answer = self.llm.generate(prompt)

        return {
            "title": "Short Notes",
            "content": answer,
            "sources": chunks,
        }

    def generate_mcqs(
        self,
        document_id: int,
        count: int = 10,
        difficulty: str = "medium",
    ) -> list[dict]:

        chunks = self.retriever.retrieve_document(document_id)

        if not chunks:
            app_logger.warning(
                f"No chunks found for MCQ generation: document_id={document_id}"
            )
            return []

        count = max(1, min(count, 50))

        if difficulty not in {"easy", "medium", "hard"}:
            difficulty = "medium"

        # A 1B model can struggle with a very large prompt.
        # Use representative chunks instead of sending the entire
        # document every time.
        selected_chunks = self._select_chunks(chunks)

        context = self._build_context(selected_chunks)

        prompt = f"""
You are an educational MCQ generator.

Create exactly {count} multiple-choice questions from the document.

Difficulty: {difficulty}

IMPORTANT RULES:
1. Use ONLY information present in the document.
2. Do not use outside knowledge.
3. Every question must have exactly 4 options.
4. Only ONE option must be correct.
5. The "answer" field MUST contain the exact text of the correct option.
6. "page" must contain the document page number where the answer is supported.
7. Keep questions clear and useful for students.
8. Return ONLY valid JSON.
9. Do NOT use Markdown.
10. Do NOT use ```json.
11. Do NOT add explanations outside the JSON.

Required format:

[
  {{
    "question": "Question text",
    "options": [
      "Option 1",
      "Option 2",
      "Option 3",
      "Option 4"
    ],
    "answer": "Option 2",
    "explanation": "Brief explanation based only on the document.",
    "page": 3
  }}
]

DOCUMENT:
{context}
"""

        try:
            response = self.llm.generate(prompt)

            app_logger.info(
                f"MCQ LLM response received for document_id={document_id}, "
                f"length={len(response) if response else 0}"
            )

            questions = self._parse_mcqs(response)

            app_logger.info(
                f"Parsed {len(questions)} MCQs for document_id={document_id}"
            )

            return questions

        except Exception as exc:
            app_logger.exception(
                f"MCQ generation failed for document_id={document_id}: {exc}"
            )
            return []

    @staticmethod
    def _select_chunks(chunks: list[dict], max_chunks: int = 28) -> list[dict]:
        """
        Select representative chunks from the document.

        Sending all 74+ chunks to a 1B model can create an unnecessarily
        large prompt and increase the chance of malformed output.
        """

        if len(chunks) <= max_chunks:
            return chunks

        # Keep chunks distributed across the document rather than
        # taking only the first pages.
        indexes = [
            round(i * (len(chunks) - 1) / (max_chunks - 1))
            for i in range(max_chunks)
        ]

        selected = []
        seen = set()

        for index in indexes:
            if index in seen:
                continue

            seen.add(index)
            selected.append(chunks[index])

        return selected

    @staticmethod
    def _build_context(chunks: list[dict]) -> str:
        context_parts = []

        for chunk in chunks:
            page = chunk.get("page")

            text = (
                chunk.get("text")
                or chunk.get("chunk_text")
                or ""
            ).strip()

            if not text:
                continue

            context_parts.append(
                f"Page {page}:\n{text}"
            )

        return "\n\n".join(context_parts)

    @staticmethod
    def _extract_json_array(response: str) -> list | None:
        """
        Extract a JSON array even if the LLM accidentally adds
        surrounding text or Markdown fences.
        """

        if not response:
            return None

        cleaned = response.strip()

        # Remove Markdown code fences.
        cleaned = re.sub(
            r"^```(?:json)?\s*",
            "",
            cleaned,
            flags=re.IGNORECASE,
        )

        cleaned = re.sub(
            r"\s*```$",
            "",
            cleaned,
        )

        cleaned = cleaned.strip()

        # First try direct JSON parsing.
        try:
            data = json.loads(cleaned)

            if isinstance(data, list):
                return data

        except json.JSONDecodeError:
            pass

        # If the model added text around the JSON,
        # locate the first '[' and last ']'.
        start = cleaned.find("[")
        end = cleaned.rfind("]")

        if start == -1 or end == -1 or end <= start:
            return None

        json_text = cleaned[start:end + 1]

        try:
            data = json.loads(json_text)

            if isinstance(data, list):
                return data

        except json.JSONDecodeError:
            return None

        return None

    @classmethod
    def _parse_mcqs(cls, response: str) -> list[dict]:

        data = cls._extract_json_array(response)

        if not data:
            app_logger.warning(
                "MCQ parser could not extract a JSON array from LLM response."
            )

            if response:
                app_logger.warning(
                    f"Raw MCQ response preview: {response[:1500]}"
                )

            return []

        questions = []

        for item in data:

            if not isinstance(item, dict):
                continue

            question = item.get("question")
            options = item.get("options")
            answer = item.get("answer")
            explanation = item.get("explanation", "")
            page = item.get("page")

            # Question
            if not isinstance(question, str):
                continue

            question = question.strip()

            if not question:
                continue

            # Options
            if not isinstance(options, list):
                continue

            if len(options) != 4:
                continue

            valid_options = []

            for option in options:

                if not isinstance(option, str):
                    valid_options = []
                    break

                option = option.strip()

                if not option:
                    valid_options = []
                    break

                valid_options.append(option)

            if len(valid_options) != 4:
                continue

            # Answer
            if not isinstance(answer, str):
                continue

            answer = answer.strip()

            # Handle models returning A/B/C/D instead of
            # the exact option text.
            answer_match = re.fullmatch(
                r"(?:option\s*)?([A-D])",
                answer,
                flags=re.IGNORECASE,
            )

            if answer_match:
                index = ord(answer_match.group(1).upper()) - ord("A")

                if 0 <= index < 4:
                    answer = valid_options[index]

            # Handle "1", "2", "3", "4"
            if answer in {"1", "2", "3", "4"}:
                answer = valid_options[int(answer) - 1]

            # Final answer validation
            if answer not in valid_options:
                continue

            # Explanation
            if not isinstance(explanation, str):
                explanation = ""

            explanation = explanation.strip()

            # Page
            try:
                page_number = int(page)

                if page_number < 1:
                    page_number = None

            except (TypeError, ValueError):
                page_number = None

            questions.append(
                {
                    "question": question,
                    "options": valid_options,
                    "answer": answer,
                    "explanation": explanation,
                    "page": page_number,
                }
            )

        return questions