from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .database import engine, Base
from .routers import products, orders, admin

# Créer les tables en base de données
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DASHA SHOP API",
    description="API e-commerce pour la boutique féminine DASHA SHOP",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS — autoriser le frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Monter le dossier uploads en fichiers statiques
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Enregistrer les routers
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {"message": "Bienvenue sur l'API DASHA SHOP 🌸", "docs": "/api/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
