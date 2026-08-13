from langchain_text_splitters import RecursiveCharacterTextSplitter


class Chunker:

    def __init__(
        self,
        chunk_size: int = 500,
        chunk_overlap: int = 100,
    ):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=[
                "\n\n",
                "\n",
                ". ",
                " ",
                ""
            ]
        )

    def split_pages(self, pages: list[dict]) -> list[dict]:
        """
        Split extracted PDF pages into chunks.

        Returns:
        [
            {
                "page": 1,
                "chunk_index": 0,
                "text": "..."
            }
        ]
        """

        chunks = []

        for page in pages:

            texts = self.text_splitter.split_text(page["text"])

            for index, chunk in enumerate(texts):

                chunks.append(
                    {
                        "page": page["page"],
                        "chunk_index": index,
                        "text": chunk,
                    }
                )

        return chunks