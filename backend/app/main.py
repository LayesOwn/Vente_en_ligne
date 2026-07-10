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
_DEFAULT_SECRET = "dasha-shop-secret-key-change-in-production"
if _IS_PROD:
    # En production, on refuse de démarrer avec des secrets par défaut/faibles.
    _errors = []
    if not os.getenv("ADMIN_PASSWORD"):
        _errors.append("ADMIN_PASSWORD n'est pas défini (mot de passe par défaut 'admin123').")
    _secret = os.getenv("SECRET_KEY", "")
    if not _secret or _secret == _DEFAULT_SECRET:
        _errors.append("SECRET_KEY n'est pas défini ou utilise la valeur par défaut.")
    elif len(_secret) < 32:
        _errors.append("SECRET_KEY trop courte (minimum 32 caractères).")
    if _errors:
        raise RuntimeError(
            "Démarrage refusé en production :\n  - "
            + "\n  - ".join(_errors)
            + "\nGénérez une clé avec : python -c \"import secrets; print(secrets.token_hex(32))\""
        )
else:
    if not os.getenv("ADMIN_PASSWORD"):
        _log.warning("ADMIN_PASSWORD non défini — mot de passe par défaut 'admin123' actif !")
    if not os.getenv("SECRET_KEY"):
        _log.warning("SECRET_KEY non défini — clé JWT par défaut utilisée. Dangereux en production !")

import uuid
from sqlalchemy import text, inspect as sa_inspect
from .database import engine, Base
from .routers import products, orders, admin

Base.metadata.create_all(bind=engine)

# ── Migrations colonnes manquantes (idempotent) ────────────────────────────────
_inspector = sa_inspect(engine)
if "shop_profile" in _inspector.get_table_names():
    _existing = {c["name"] for c in _inspector.get_columns("shop_profile")}
    _to_add = {
        "logo": "VARCHAR(500)",
        "about": "TEXT",
    }
    with engine.connect() as _conn:
        for _col, _type in _to_add.items():
            if _col not in _existing:
                _conn.execute(text(f"ALTER TABLE shop_profile ADD COLUMN {_col} {_type}"))
                _conn.commit()
                _log.info(f"Migration : colonne shop_profile.{_col} ajoutée")

# ── Migration : jeton public des commandes (idempotent) ────────────────────────
if "orders" in _inspector.get_table_names():
    _order_cols = {c["name"] for c in _inspector.get_columns("orders")}
    with engine.connect() as _conn:
        if "public_token" not in _order_cols:
            _conn.execute(text("ALTER TABLE orders ADD COLUMN public_token VARCHAR(32)"))
            _conn.commit()
            _log.info("Migration : colonne orders.public_token ajoutée")
        # Backfill des commandes existantes sans jeton
        _rows = _conn.execute(text("SELECT id FROM orders WHERE public_token IS NULL")).fetchall()
        for (_oid,) in _rows:
            _conn.execute(
                text("UPDATE orders SET public_token = :tok WHERE id = :oid"),
                {"tok": uuid.uuid4().hex, "oid": _oid},
            )
        if _rows:
            _conn.commit()
            _log.info(f"Migration : {len(_rows)} commande(s) dotée(s) d'un jeton public")
        # Index unique pour garantir l'unicité et accélérer la recherche par jeton
        _conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_orders_public_token ON orders (public_token)"))
        _conn.commit()

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

    _DIST_ROOT = _DIST.resolve()

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        target = (_DIST_ROOT / full_path).resolve()
        # Anti path-traversal : le fichier servi doit rester dans _DIST
        if target.is_file() and target.is_relative_to(_DIST_ROOT):
            return FileResponse(str(target))
        return FileResponse(str(_DIST_ROOT / "index.html"))
else:
    @app.get("/")
    def root():
        return {"message": "DASHA SHOP API"}
