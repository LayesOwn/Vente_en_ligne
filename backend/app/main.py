import os
import logging
import pathlib
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from dotenv import load_dotenv

load_dotenv()

_log = logging.getLogger("dasha")
_IS_PROD = os.getenv("ENVIRONMENT", "").lower() == "production"

# ── Vérifications de démarrage ─────────────────────────────────────────────────
if not os.getenv("ADMIN_PASSWORD"):
    _log.warning("ADMIN_PASSWORD non défini — mot de passe par défaut 'admin123' actif !")
if not os.getenv("SECRET_KEY"):
    _log.warning("SECRET_KEY non défini — clé JWT par défaut utilisée. Dangereux en production !")
if _IS_PROD and len(os.getenv("SECRET_KEY", "")) < 32:
    _log.error("SECRET_KEY trop courte pour la production (minimum 32 caractères). Générez-en une avec : python -c \"import secrets; print(secrets.token_hex(32))\"")

from .database import engine, Base
from .routers import products, orders, admin

Base.metadata.create_all(bind=engine)

# ── Application ────────────────────────────────────────────────────────────────
app = FastAPI(
    title="DASHA SHOP API",
    description="API e-commerce DASHA SHOP — Mode & Accessoires",
    version="1.0.0",
    # Docs désactivées en production
    docs_url=None if _IS_PROD else "/api/docs",
    redoc_url=None if _IS_PROD else "/api/redoc",
    openapi_url=None if _IS_PROD else "/api/openapi.json",
)

# ── Middleware : en-têtes de sécurité HTTP ─────────────────────────────────────
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=()"
        if _IS_PROD:
            # HSTS : forcer HTTPS pendant 1 an
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# ── CORS ───────────────────────────────────────────────────────────────────────
_frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
_allowed_origins = [_frontend_url]
if not _IS_PROD:
    # En dev local uniquement
    _allowed_origins += ["http://localhost:3000", "http://127.0.0.1:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Uploads produits ───────────────────────────────────────────────────────────
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ── Routers API ────────────────────────────────────────────────────────────────
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(admin.router)

# ── Santé ──────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok"}

# ── Frontend React (production) ────────────────────────────────────────────────
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
        return {"message": "DASHA SHOP API"}
