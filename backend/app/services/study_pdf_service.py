from io import BytesIO
from xml.sax.saxutils import escape

from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.lib import colors


class StudyPDFService:
    """
    Generates printable PDF study material.

    Supported formats:
    - Short Notes
    - MCQs
    """

    @staticmethod
    def _styles():
        styles = getSampleStyleSheet()

        return {
            "title": ParagraphStyle(
                "StudyTitle",
                parent=styles["Title"],
                fontSize=20,
                leading=24,
                alignment=TA_CENTER,
                spaceAfter=18,
            ),
            "heading": ParagraphStyle(
                "StudyHeading",
                parent=styles["Heading2"],
                fontSize=14,
                leading=18,
                spaceBefore=12,
                spaceAfter=8,
            ),
            "body": ParagraphStyle(
                "StudyBody",
                parent=styles["BodyText"],
                fontSize=10.5,
                leading=16,
                spaceAfter=8,
            ),
            "question": ParagraphStyle(
                "StudyQuestion",
                parent=styles["BodyText"],
                fontSize=11,
                leading=16,
                spaceBefore=10,
                spaceAfter=8,
            ),
            "option": ParagraphStyle(
                "StudyOption",
                parent=styles["BodyText"],
                fontSize=10,
                leading=14,
                leftIndent=10,
                spaceAfter=4,
            ),
            "answer": ParagraphStyle(
                "StudyAnswer",
                parent=styles["BodyText"],
                fontSize=10,
                leading=15,
                spaceBefore=5,
                spaceAfter=5,
            ),
            "page": ParagraphStyle(
                "StudyPage",
                parent=styles["BodyText"],
                fontSize=8.5,
                leading=12,
            ),
        }

    @staticmethod
    def _safe_text(value) -> str:
        if value is None:
            return ""

        return escape(str(value)).replace(
            "\n",
            "<br/>",
        )

    # ========================================================
    # Short Notes PDF
    # ========================================================

    @classmethod
    def generate_short_notes_pdf(
        cls,
        title: str,
        content: str,
    ) -> BytesIO:

        buffer = BytesIO()

        document = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=18 * mm,
            leftMargin=18 * mm,
            topMargin=18 * mm,
            bottomMargin=18 * mm,
            title=title,
            author="Aureum Search",
        )

        styles = cls._styles()

        story = []

        story.append(
            Paragraph(
                cls._safe_text(title),
                styles["title"],
            )
        )

        story.append(
            Paragraph(
                "Generated Study Notes",
                styles["heading"],
            )
        )

        # ----------------------------------------------------
        # Basic Markdown-style rendering
        # ----------------------------------------------------

        lines = content.splitlines()

        for raw_line in lines:
            line = raw_line.strip()

            if not line:
                story.append(
                    Spacer(
                        1,
                        4,
                    )
                )
                continue

            # Markdown heading
            if line.startswith("# "):
                heading = line[2:].strip()

                story.append(
                    Paragraph(
                        cls._safe_text(heading),
                        styles["heading"],
                    )
                )
                continue

            if line.startswith("## "):
                heading = line[3:].strip()

                story.append(
                    Paragraph(
                        cls._safe_text(heading),
                        styles["heading"],
                    )
                )
                continue

            if line.startswith("### "):
                heading = line[4:].strip()

                story.append(
                    Paragraph(
                        cls._safe_text(heading),
                        styles["heading"],
                    )
                )
                continue

            # Bullet point
            if line.startswith("- "):
                bullet = line[2:].strip()

                story.append(
                    Paragraph(
                        f"• {cls._safe_text(bullet)}",
                        styles["body"],
                    )
                )
                continue

            if line.startswith("* "):
                bullet = line[2:].strip()

                story.append(
                    Paragraph(
                        f"• {cls._safe_text(bullet)}",
                        styles["body"],
                    )
                )
                continue

            # Numbered item
            if len(line) > 2 and line[0].isdigit():
                dot_index = line.find(". ")

                if dot_index > 0:
                    number = line[:dot_index]
                    text = line[dot_index + 2:]

                    story.append(
                        Paragraph(
                            f"<b>{cls._safe_text(number)}.</b> "
                            f"{cls._safe_text(text)}",
                            styles["body"],
                        )
                    )
                    continue

            # Normal paragraph
            story.append(
                Paragraph(
                    cls._safe_text(line),
                    styles["body"],
                )
            )

        document.build(story)

        buffer.seek(0)

        return buffer

    # ========================================================
    # MCQ PDF
    # ========================================================

    @classmethod
    def generate_mcq_pdf(
        cls,
        title: str,
        questions: list[dict],
    ) -> BytesIO:

        buffer = BytesIO()

        document = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=18 * mm,
            leftMargin=18 * mm,
            topMargin=18 * mm,
            bottomMargin=18 * mm,
            title=title,
            author="Aureum Search",
        )

        styles = cls._styles()

        story = []

        # ----------------------------------------------------
        # Title
        # ----------------------------------------------------

        story.append(
            Paragraph(
                cls._safe_text(title),
                styles["title"],
            )
        )

        story.append(
            Paragraph(
                f"Total Questions: {len(questions)}",
                styles["body"],
            )
        )

        story.append(
            Spacer(
                1,
                8,
            )
        )

        # ----------------------------------------------------
        # Questions
        # ----------------------------------------------------

        for index, question in enumerate(
            questions,
            start=1,
        ):

            question_text = question.get(
                "question",
                "",
            )

            story.append(
                Paragraph(
                    f"<b>{index}. "
                    f"{cls._safe_text(question_text)}</b>",
                    styles["question"],
                )
            )

            options = question.get(
                "options",
                [],
            )

            option_labels = [
                "A",
                "B",
                "C",
                "D",
            ]

            for label, option in zip(
                option_labels,
                options,
            ):
                story.append(
                    Paragraph(
                        f"{label}. "
                        f"{cls._safe_text(option)}",
                        styles["option"],
                    )
                )

            page = question.get(
                "page"
            )

            if page:
                story.append(
                    Paragraph(
                        f"Source: Page {page}",
                        styles["page"],
                    )
                )

            story.append(
                Spacer(
                    1,
                    8,
                )
            )

        # ----------------------------------------------------
        # Answer Key
        # ----------------------------------------------------

        story.append(PageBreak())

        story.append(
            Paragraph(
                "Answer Key",
                styles["heading"],
            )
        )

        answer_rows = [
            [
                Paragraph(
                    "<b>Question</b>",
                    styles["body"],
                ),
                Paragraph(
                    "<b>Answer</b>",
                    styles["body"],
                ),
            ]
        ]

        for index, question in enumerate(
            questions,
            start=1,
        ):
            answer = question.get(
                "answer",
                "",
            )

            answer_rows.append(
                [
                    str(index),
                    cls._safe_text(answer),
                ]
            )

        answer_table = Table(
            answer_rows,
            colWidths=[
                30 * mm,
                125 * mm,
            ],
            repeatRows=1,
        )

        answer_table.setStyle(
            TableStyle(
                [
                    (
                        "GRID",
                        (0, 0),
                        (-1, -1),
                        0.5,
                        colors.grey,
                    ),
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, 0),
                        colors.lightgrey,
                    ),
                    (
                        "VALIGN",
                        (0, 0),
                        (-1, -1),
                        "TOP",
                    ),
                    (
                        "LEFTPADDING",
                        (0, 0),
                        (-1, -1),
                        8,
                    ),
                    (
                        "RIGHTPADDING",
                        (0, 0),
                        (-1, -1),
                        8,
                    ),
                    (
                        "TOPPADDING",
                        (0, 0),
                        (-1, -1),
                        6,
                    ),
                    (
                        "BOTTOMPADDING",
                        (0, 0),
                        (-1, -1),
                        6,
                    ),
                ]
            )
        )

        story.append(answer_table)

        # ----------------------------------------------------
        # Explanations
        # ----------------------------------------------------

        story.append(
            Spacer(
                1,
                16,
            )
        )

        story.append(
            Paragraph(
                "Explanations",
                styles["heading"],
            )
        )

        for index, question in enumerate(
            questions,
            start=1,
        ):
            explanation = question.get(
                "explanation",
                "",
            )

            if not explanation:
                continue

            page = question.get(
                "page"
            )

            source_text = (
                f" — Page {page}"
                if page
                else ""
            )

            story.append(
                Paragraph(
                    f"<b>{index}.</b> "
                    f"{cls._safe_text(explanation)}"
                    f"{cls._safe_text(source_text)}",
                    styles["answer"],
                )
            )

        document.build(story)

        buffer.seek(0)

        return buffer