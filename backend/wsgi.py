import sys
import os

# Répertoire du fichier wsgi.py = dossier backend/
path = os.path.dirname(os.path.abspath(__file__))

# Définir le répertoire de travail sur backend/
# IMPORTANT : sans ça, SQLite crée la DB au mauvais endroit
os.chdir(path)

if path not in sys.path:
    sys.path.insert(0, path)

# Charger les variables d'environnement depuis backend/.env
from dotenv import load_dotenv
load_dotenv(os.path.join(path, ".env"))

# Adapter l'app ASGI (FastAPI) pour WSGI (PythonAnywhere)
from a2wsgi import ASGIMiddleware
from app.main import app

application = ASGIMiddleware(app)
