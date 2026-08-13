from app.rag.llm import LLMService

llm = LLMService()

response = llm.generate(
    "Explain Retrieval-Augmented Generation in one sentence."
)

print(response)