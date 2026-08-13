import fitz


class PDFService:

    @staticmethod
    def get_page_count(file_path: str) -> int:
        pdf = fitz.open(file_path)
        pages = pdf.page_count
        pdf.close()
        return pages

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

        pages = []

        for page_number, page in enumerate(pdf, start=1):
            pages.append(
                {
                    "page": page_number,
                    "text": page.get_text("text"),
                }
            )

        pdf.close()

        return pages