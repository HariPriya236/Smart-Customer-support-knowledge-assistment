import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

from app.core.config import settings
from app.core.rate_limiter import limiter
from app.db.base import Base
from app.db.session import engine
from app.api.v1 import auth, upload, query, history, analytics, documents

# Auto-create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Production Agentic RAG Customer Support Knowledge Assistant API"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register V1 Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(upload.router, prefix=settings.API_V1_STR)
app.include_router(query.router, prefix=settings.API_V1_STR)
app.include_router(history.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi import HTTPException

# Determine static frontend directory location
static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "static"))
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

target_static = None
if os.path.exists(static_dir) and os.path.exists(os.path.join(static_dir, "index.html")):
    target_static = static_dir
elif os.path.exists(frontend_dist) and os.path.exists(os.path.join(frontend_dist, "index.html")):
    target_static = frontend_dist

@app.api_route("/health", methods=["GET", "HEAD"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "llm_provider": settings.DEFAULT_LLM_PROVIDER,
        "vector_store": settings.VECTOR_DB_TYPE
    }

if target_static:
    assets_path = os.path.join(target_static, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    @app.api_route("/", methods=["GET", "HEAD"])
    def serve_index():
        return FileResponse(os.path.join(target_static, "index.html"))

    @app.api_route("/{full_path:path}", methods=["GET", "HEAD"])
    def serve_react_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json") or full_path.startswith("health"):
            raise HTTPException(status_code=404, detail="Not Found")
        file_path = os.path.join(target_static, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(target_static, "index.html"))
else:
    @app.api_route("/", methods=["GET", "HEAD"])
    def root():
        return {
            "status": "online",
            "message": "Welcome to SupportIQ API - Smart Customer Support Knowledge Assistant",
            "docs_url": "/docs",
            "health_check": "/health"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
