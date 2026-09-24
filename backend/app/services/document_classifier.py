import re


class DocumentClassifier:
    """
    Classifies an extracted PDF into a broad document category.

    This is intentionally a lightweight first-pass classifier.
    It does not use an external API or LLM.
    """

    STUDY_KEYWORDS = {
        "chapter",
        "lecture",
        "lesson",
        "module",
        "unit",
        "syllabus",
        "assignment",
        "exercise",
        "question",
        "answer",
        "exam",
        "quiz",
        "semester",
        "course",
        "subject",
        "textbook",
        "tutorial",
        "learning",
        "definition",
        "theorem",
        "algorithm",
        "concept",
        "notes",
        "references",
        "objective",
        "summary",
        "review",
        "practice",
    }

    @classmethod
    def classify(cls, pages: list[dict]) -> str:
        """
        Classify a PDF based on extracted text.

        Returns:
            "study"
            "general"
            "empty"
        """

        if not pages:
            return "empty"

        texts = [
            page.get("text", "").strip()
            for page in pages
        ]

        full_text = "\n".join(
            text for text in texts if text
        ).strip()

        if not full_text:
            return "empty"

        normalized_text = full_text.lower()

        words = re.findall(
            r"\b[a-zA-Z]{3,}\b",
            normalized_text,
        )

        if not words:
            return "empty"

        word_count = len(words)

        keyword_matches = sum(
            1
            for keyword in cls.STUDY_KEYWORDS
            if re.search(
                rf"\b{re.escape(keyword)}\b",
                normalized_text,
            )
        )

        keyword_density = keyword_matches / len(cls.STUDY_KEYWORDS)

        structural_score = 0

        if re.search(
            r"\b(chapter|unit|module|lesson)\s+\d+",
            normalized_text,
        ):
            structural_score += 2

        if re.search(
            r"\b\d+\.\d+\s+[A-Z][a-zA-Z]",
            full_text,
        ):
            structural_score += 1

        if re.search(
            r"\b(learning objectives?|objectives)\b",
            normalized_text,
        ):
            structural_score += 2

        if re.search(
            r"\b(review questions?|practice questions?|exam questions?)\b",
            normalized_text,
        ):
            structural_score += 2

        if re.search(
            r"\b(abstract|introduction|methodology|results|conclusion)\b",
            normalized_text,
        ):
            structural_score += 1

        score = 0

        if keyword_matches >= 3:
            score += 2

        if keyword_matches >= 6:
            score += 2

        if keyword_density >= 0.15:
            score += 1

        score += structural_score

        # Very small documents are still allowed.
        # They are simply classified according to their content.
        if word_count < 80:
            return "general"

        if score >= 4:
            return "study"

        return "general"