import os
import logging
import pathlib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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

from sqlalchemy import text
from .database import engine, Base
from .routers import products, orders, admin

Base.metadata.create_all(bind=engine)

# ── Migrations colonnes manquantes (idempotent) ────────────────────────────────
_MIGRATIONS = [
    "ALTER TABLE shop_profile ADD COLUMN logo VARCHAR(500)",
    "ALTER TABLE shop_profile ADD COLUMN about TEXT",
]
with engine.connect() as _conn:
    for _sql in _MIGRATIONS:
        try:
            _conn.execute(text(_sql))
            _conn.commit()
        except Exception:
            pass  # colonne déjà présente

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

# ── Middleware : en-têtes de sécurité HTTP (ASGI pur, compatible a2wsgi) ───────
_SECURITY_HEADERS = [
    (b"x-content-type-options", b"nosniff"),
    (b"x-frame-options", b"DENY"),
    (b"referrer-policy", b"strict-origin-when-cross-origin"),
    (b"permissions-policy", b"geolocation=(), microphone=()"),
]
if _IS_PROD:
    _SECURITY_HEADERS.append(
        (b"strict-transport-security", b"max-age=31536000; includeSubDomains")
    )

class SecurityHeadersMiddleware:
    def __init__(self, app, **kwargs):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        async def send_with_headers(message):
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", [])) + _SECURITY_HEADERS
                message = {**message, "headers": headers}
            await send(message)

        await self.app(scope, receive, send_with_headers)

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
