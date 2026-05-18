import os
import pathlib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv

load_dotenv()

from .database import engine, Base
from .routers import products, orders, admin

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DASHA SHOP API",
    description="API e-commerce DASHA SHOP — Mode & Accessoires",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS — dev local uniquement (inutile en prod quand tout est servi par FastAPI)
_frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[_frontend_url, "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uploads produits
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Routers API
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(admin.router)

# ── Santé ──────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok"}

# ── Frontend React (production) ────────────────────────────────────────────────
# En développement, Vite sert le frontend sur son propre port.
# En production (PythonAnywhere), FastAPI sert les fichiers buildés.
_DIST = pathlib.Path(__file__).parent.parent.parent / "frontend" / "dist"

if _DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(_DIST / "assets")), name="frontend-assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        file = _DIST / full_path
        if file.is_file():
            return FileResponse(str(file))
        return FileResponse(str(_DIST / "index.html"))
else:
    @app.get("/")
    def root():
        return {"message": "DASHA SHOP API", "docs": "/api/docs"}
