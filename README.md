# 📚 Aureum Search --- AI-Powered Document Search & Study Assistant

Aureum Search is a document-focused AI application that helps students
understand, explore, and revise information from uploaded PDF files.
Users can ask questions about a document, explore its topics, generate
study material, and download supported outputs as PDFs.

**Core principle:** responses should be grounded in the uploaded
document rather than unsupported outside information.

**GitHub Repository:**
[Ananthu952/RAG](https://github.com/Ananthu952/RAG)

------------------------------------------------------------------------

## 📌 Overview

Aureum Search is a Retrieval-Augmented Generation (RAG) application for
PDF understanding. It extracts text page by page, splits it into
searchable chunks, creates embeddings, and stores them in
document-specific FAISS indexes. When a user asks a question, the
application retrieves relevant content and passes it to a locally
running language model through Ollama.

The application also includes study tools for generating short notes and
multiple-choice questions (MCQs), PDF export, document topics, and
persistent conversations. Conversation history is stored in the database
and remains available after refreshing the page.

## ✨ Features

### 📄 PDF Upload and Processing

-   Upload PDF documents through the application.
-   Extract text page by page using PyMuPDF.
-   Track document metadata such as filename, page count, file size, and
    indexing status.
-   Classify documents as study-oriented or general content.
-   Detect PDFs with no extractable text and report that they cannot be
    indexed as normal text PDFs.

> Scanned or image-only PDFs may require OCR before their text can be
> searched.

### 🔎 Document Search and Q&A

-   Ask natural-language questions about an uploaded document.
-   Retrieve relevant chunks using Sentence Transformers embeddings and
    FAISS similarity search.
-   Keep retrieval scoped to the selected document.
-   Return source chunks with page metadata to help locate supporting
    content.
-   Provide a fallback response when relevant information cannot be
    found in the indexed content.

### 🧠 Understand Documents

-   **Ask:** ask questions about the document.
-   **Explain:** request an explanation of the document's content.
-   **Summarize:** create a concise summary.
-   **Document Topics:** view topics associated with the document.

### 🎓 Study Tools

-   Generate exam-oriented short notes from indexed document content.
-   Generate MCQs with four options, an answer, an explanation, and a
    page reference where available.
-   Choose an MCQ count and difficulty level.
-   Download generated short notes and MCQs as PDF study material.

Generation quality and response time depend on document size, context
length, and local model capabilities. Generated study material should be
checked against the original document.

### 💬 Persistent Conversations

-   Create a new conversation.
-   Open previous conversations from the sidebar.
-   Rename and delete conversations.
-   Persist conversations and messages in the database across page
    refreshes.

### 💾 Local Vector Storage

-   Generate embeddings with Sentence Transformers.
-   Store searchable document vectors in FAISS indexes.
-   Persist indexes so documents can remain searchable after restarting
    the application, provided the stored files remain available.

## 🧰 Technology Stack

### Frontend

-   React
-   TypeScript
-   Vite
-   Tailwind CSS
-   Axios
-   React Router
-   Lucide React

### Backend

-   Python 3.11+
-   FastAPI
-   Uvicorn
-   Pydantic
-   SQLAlchemy
-   SQLite

### AI and Document Processing

-   LangChain
-   FAISS
-   Sentence Transformers
-   PyMuPDF (`fitz`)
-   Ollama
-   Llama 3.2 1B (`llama3.2:1b`)

### PDF Export and Development

-   ReportLab
-   Git and GitHub
-   Visual Studio Code
-   Node.js and npm
-   Python virtual environment

## 🏗️ Architecture

``` text
┌──────────────────────────────────┐
│          React Frontend           │
│  TypeScript · Vite · Tailwind     │
│  Upload · Chat · Study Tools      │
└─────────────────┬────────────────┘
                  │ HTTP / REST API
                  ▼
┌──────────────────────────────────┐
│          FastAPI Backend          │
│  Document & Conversation APIs     │
│  PDF Extraction · Study Engine    │
│  Topics · PDF Export               │
└────────────┬──────────────┬───────┘
             │              │
             ▼              ▼
┌────────────────────┐  ┌─────────────────────┐
│ Retrieval Pipeline  │  │   SQLite Database   │
│ Chunking            │  │ Documents            │
│ Sentence Embeddings │  │ Document Chunks      │
│ FAISS Vector Search │  │ Conversations        │
└────────────┬───────┘  │ Conversation Messages│
             │          └─────────────────────┘
             ▼
┌──────────────────────────────────┐
│       Ollama Local LLM            │
│          llama3.2:1b              │
│ Answers · Summaries · Study Tools │
└──────────────────────────────────┘
```

## 📁 Project Structure

The following structure is illustrative. Refer to the repository for the
exact current filenames.

``` text
RAG/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   ├── core/
│   │   ├── database/
│   │   ├── rag/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── static/
│   │   ├── templates/
│   │   └── main.py
│   ├── uploads/
│   ├── vector_db/
│   ├── requirements.txt
│   └── ...
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
└── README.md
```

## ⚙️ Getting Started

### Prerequisites

-   Python 3.11 or later, compatible with backend dependencies.
-   Node.js and npm.
-   Git.
-   [Ollama](https://ollama.com/) installed and running.
-   Enough disk space and memory for the embedding model and local
    language model.

### 1. Clone the Repository

``` bash
git clone https://github.com/Ananthu952/RAG.git
cd RAG
```

### 2. Download the Ollama Model

Start Ollama, then download the model used by the application:

``` bash
ollama pull llama3.2:1b
ollama list
```

Keep the Ollama service running while using AI features. If the project
configuration specifies another model name, ensure that the installed
model and application configuration match.

### 3. Set Up the Backend

``` bash
cd backend
python -m venv venv
```

Activate the environment.

**Windows PowerShell:**

``` powershell
.\venv\Scripts\Activate.ps1
```

**Windows Command Prompt:**

``` bat
venv\Scripts\activate.bat
```

**macOS / Linux:**

``` bash
source venv/bin/activate
```

Install dependencies:

``` bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Start the FastAPI development server from the directory where the `app`
package can be imported. For a typical layout where `backend` is the
working directory:

``` bash
uvicorn app.main:app --reload
```

Typical local addresses:

-   Backend API: `http://127.0.0.1:8000`
-   Interactive API documentation: `http://127.0.0.1:8000/docs`

If the repository uses a different working directory or configuration,
run the command from the directory that contains the importable `app`
package.

### 4. Set Up the Frontend

Open a second terminal and go to the frontend directory:

``` bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually:

``` text
http://localhost:5173
```

If the frontend uses an environment variable for its API base URL,
configure it using the variable name expected by the project's Axios
configuration. For local development, the API should point to the
FastAPI backend, typically `http://127.0.0.1:8000`.

### 5. Run the Application

Keep the services running in separate terminals.

  Service             Typical local address
  ------------------- ------------------------------
  React frontend      `http://localhost:5173`
  FastAPI backend     `http://127.0.0.1:8000`
  API documentation   `http://127.0.0.1:8000/docs`
  Ollama              `http://localhost:11434`

Confirm that the frontend API URL matches the backend address and that
Ollama is running before testing AI features.

## 🔌 API Overview

The backend exposes REST endpoints for document operations, chat, study
generation, and conversation history. Exact paths and request/response
schemas are defined in the route modules.

  -----------------------------------------------------------------------
  Area                                Purpose
  ----------------------------------- -----------------------------------
  Documents                           Upload PDFs and access document
                                      metadata

  Chat                                Ask questions, explain content, and
                                      summarize a selected document

  Topics                              Retrieve topics associated with a
                                      document

  Study                               Generate short notes and MCQs

  PDF Export                          Download generated notes and MCQs
                                      as PDF files

  Conversations                       Create, list, open, rename, and
                                      delete saved conversations
  -----------------------------------------------------------------------

For the authoritative endpoint list, start the backend and open `/docs`.

## 🔄 Typical User Workflow

1.  Start Ollama, the FastAPI backend, and the frontend.
2.  Upload a text-based PDF.
3.  Wait for text extraction, chunking, embedding, and indexing to
    finish.
4.  Ask a question or use Explain / Summarize.
5.  Explore document topics.
6.  Generate short notes or MCQs for study and revision.
7.  Download supported study materials as PDF files.
8.  Return to a saved conversation from the conversation sidebar.

## 🔒 Privacy and Security Considerations

-   When configured for local Ollama inference, prompts can be processed
    on the local machine without a hosted LLM API.
-   PDF files, SQLite data, and FAISS indexes are stored according to
    the application's local configuration.
-   Do not commit uploaded documents, local databases, vector indexes,
    virtual environments, or secret configuration files to GitHub.
-   Keep environment secrets out of source control.
-   A production deployment should configure upload limits, file
    validation, authentication and authorization where needed, error
    handling, logging, and persistent storage.
-   Local URLs such as `localhost` are not reachable by other users over
    the internet.
-   A fresh installation is not fully offline: installing packages and
    downloading models normally require internet access. After setup,
    local inference can work without a hosted LLM API if the required
    models, files, and services are available.

## 🚀 Deployment

Aureum Search uses a local FastAPI backend, local storage, FAISS, and
Ollama. A public deployment requires additional configuration because a
hosted frontend cannot access the developer's local machine.

For deployment:

1.  Build and deploy the frontend.
2.  Deploy the FastAPI backend to a Python-compatible host.
3.  Configure the frontend API base URL to point to the deployed
    backend.
4.  Ensure the host can run the embedding model and Ollama model, or
    intentionally configure another supported inference service.
5.  Configure persistent storage for uploaded PDFs, SQLite data, and
    FAISS indexes.
6.  Configure allowed origins and production environment variables
    securely.
7.  Test upload, indexing, Q&A, saved conversations, study generation,
    and PDF downloads in the deployed environment.

Free hosting environments may have limited RAM, CPU, disk space,
execution time, and persistent storage. Check these constraints before
choosing a host for local LLM inference.

## 🗺️ Future Enhancements

Potential improvements include:

-   OCR support for scanned PDFs.
-   More robust and faster MCQ generation with validation and retry
    handling.
-   Additional study formats such as flashcards, quizzes, and exam
    practice.
-   More export formats and improved PDF layouts.
-   Better progress indicators for indexing and generation.
-   Automated backend and frontend tests.
-   Improved deployment, monitoring, and resource management.

These are possible enhancements and should be marked as completed only
after implementation and testing.

## 👨‍💻 Author

**Ananthu S**

GitHub: [@Ananthu952](https://github.com/Ananthu952)

------------------------------------------------------------------------

⭐ If you find Aureum Search useful, consider starring the repository.
