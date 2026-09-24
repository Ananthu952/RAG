import fitz


class PDFService:

    @staticmethod
    def get_page_count(file_path: str) -> int:
        pdf = fitz.open(file_path)

        try:
            return pdf.page_count
        finally:
            pdf.close()

    @staticmethod
    def extract_text(file_path: str) -> list[dict]:
        """
        Extract text page by page.

        Returns:
        [
            {
                "page": 1,
                "text": "..."
            }
        ]
        """

        pdf = fitz.open(file_path)

        try:
            pages = []

            for page_number, page in enumerate(
                pdf,
                start=1,
            ):
                pages.append(
                    {
                        "page": page_number,
                        "text": page.get_text("text"),
                    }
                )

            return pages

        finally:
            pdf.close()