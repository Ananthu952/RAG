from time import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.database.init_db import init_db
from app.database.session import SessionLocal
from app.api.routes.documents import router as document_router

from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logger import app_logger
from app.api.routes.chat import router as chat_router
from app.api.routes.dashboard import router as dashboard_router
from app.rag.index_loader import restore_vector_store


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI Document Search API",
    docs_url="/docs",
    redoc_url="/redoc",
)


# Register global exception handlers
register_exception_handlers(app)

app.include_router(document_router)
app.include_router(chat_router)
app.include_router(dashboard_router)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time()

    app_logger.info(f"Request Started: {request.method} {request.url.path}")

    response = await call_next(request)

    process_time = time() - start_time

    app_logger.info(
        f"Request Completed: {request.method} {request.url.path} "
        f"Status={response.status_code} Time={process_time:.3f}s"
    )

    return response

@app.on_event("startup")
async def startup_event():
    init_db()
    app_logger.info("Database initialized successfully.")

    # Rebuild the in-memory FAISS vector store from whatever was
    # already indexed and persisted to disk/DB in a previous run, so
    # previously uploaded documents remain queryable after a restart.
    db = SessionLocal()
    try:
        restore_vector_store(db)
    finally:
        db.close()

@app.get("/")
async def root():
    return {
        "message": "Welcome to AI Document Search API",
        "version": settings.APP_VERSION,
        "status": "running",
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "application": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }