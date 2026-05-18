# DASHA SHOP — Boutique E-commerce Féminine

Application web e-commerce complète pour la vente de vêtements, chaussures, sacs, bijoux et accessoires féminins.

---

## Stack Technique

| Couche | Technologie |
|---|---|
| Frontend | React 18 + Vite + TailwindCSS + Framer Motion |
| Backend | Python FastAPI + SQLAlchemy |
| Base de données | SQLite (migration PostgreSQL prête) |
| PDF | ReportLab |
| Paiements | Wave, Orange Money, Paiement à la livraison |

---

## Structure du Projet

```
Vente_en_ligne/
├── backend/
│   ├── app/
│   │   ├── main.py           # Point d'entrée FastAPI
│   │   ├── database.py       # Configuration SQLAlchemy
│   │   ├── models.py         # Modèles ORM
│   │   ├── schemas.py        # Schémas Pydantic
│   │   ├── routers/
│   │   │   ├── products.py   # CRUD produits
│   │   │   ├── orders.py     # Gestion commandes + facture PDF
│   │   │   └── admin.py      # Stats + upload images
│   │   └── utils/
│   │       └── pdf.py        # Génération facture PDF
│   ├── seed.py               # Données de démonstration (16 produits)
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/index.js      # Appels API centralisés
│   │   ├── context/
│   │   │   └── CartContext.jsx   # Panier global (localStorage)
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   └── CartDrawer.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx              # Page accueil avec hero
│   │   │   ├── Products.jsx          # Boutique + filtres + recherche
│   │   │   ├── ProductDetail.jsx     # Fiche produit
│   │   │   ├── Checkout.jsx          # Formulaire commande
│   │   │   ├── OrderConfirmation.jsx # Page de confirmation
│   │   │   └── admin/
│   │   │       ├── AdminLayout.jsx   # Sidebar admin
│   │   │       ├── Dashboard.jsx     # Tableau de bord stats
│   │   │       ├── AdminProducts.jsx # Liste + suppression produits
│   │   │       ├── AddEditProduct.jsx# Formulaire création/édition
│   │   │       └── AdminOrders.jsx   # Gestion commandes + statuts
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js        # Proxy vers backend :8000
│   └── tailwind.config.js
├── install.bat               # Script d'installation Windows
├── start.bat                 # Script de démarrage Windows
└── README.md
```

---

## Installation Rapide (Windows)

### Prérequis
- Python 3.10+
- Node.js 18+

### Méthode automatique

1. Double-cliquer sur `install.bat`
2. Double-cliquer sur `start.bat`

### Méthode manuelle

**Backend :**
```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
source venv/bin/activate    # Linux/Mac
pip install -r requirements.txt
python seed.py              # Charge les données de démonstration
uvicorn app.main:app --reload --port 8000
```

**Frontend :**
```bash
cd frontend
npm install
npm run dev
```

### URLs
| Service | URL |
|---|---|
| Boutique | http://localhost:5173 |
| Admin | http://localhost:5173/admin |
| API Docs | http://localhost:8000/api/docs |

---

## API REST

### Produits
| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | Liste (params: `category`, `search`) |
| GET | `/api/products/{id}` | Détail produit |
| GET | `/api/products/categories` | Liste des catégories |
| POST | `/api/products` | Créer un produit |
| PUT | `/api/products/{id}` | Modifier un produit |
| DELETE | `/api/products/{id}` | Supprimer un produit |

### Commandes
| Méthode | Endpoint | Description |
|---|---|---|
| POST | `/api/orders` | Créer une commande |
| GET | `/api/orders` | Lister toutes les commandes |
| GET | `/api/orders/{id}` | Détail commande |
| PUT | `/api/orders/{id}/status` | Changer le statut |
| GET | `/api/orders/{id}/invoice` | Télécharger la facture PDF |

### Admin
| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/stats` | Statistiques dashboard |
| POST | `/api/admin/upload` | Upload d'image (max 5 MB) |

### Statuts de commande
- `en_attente` — nouvelle commande
- `confirmee` — confirmée par l'admin
- `en_livraison` — en cours de livraison
- `livree` — livrée avec succès
- `annulee` — annulée

---

## Base de Données

### Table `products`
```sql
id, name, description, price, stock, category, image, created_at
```

### Table `orders`
```sql
id, customer_name, phone, city, payment_method, total, status, created_at
```

### Table `order_items`
```sql
id, order_id, product_id, quantity, price
```

---

## Variables d'Environnement

Fichier `backend/.env` :
```env
DATABASE_URL=sqlite:///./dasha_shop.db
UPLOAD_DIR=uploads
SECRET_KEY=votre-secret-key-ici
ADMIN_PASSWORD=admin123
```

### Migration vers PostgreSQL

Remplacer dans `.env` :
```env
DATABASE_URL=postgresql://user:password@localhost:5432/dasha_shop
```
Puis ajouter `psycopg2-binary` dans `requirements.txt`.

---

## Déploiement PythonAnywhere

1. **Uploader les fichiers** via l'interface Files ou Git

2. **Installer les dépendances :**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configurer le fichier WSGI** (`/var/www/yourusername_pythonanywhere_com_wsgi.py`) :
   ```python
   import sys
   sys.path.insert(0, '/home/yourusername/Vente_en_ligne/backend')
   
   from app.main import app as application
   ```

4. **Configurer les fichiers statiques** dans PythonAnywhere :
   - URL: `/uploads/`
   - Répertoire: `/home/yourusername/Vente_en_ligne/backend/uploads/`

5. **Build du frontend :**
   ```bash
   cd frontend
   npm run build
   ```
   Servir le dossier `dist/` comme site statique ou via Nginx.

6. **Initialiser la base :**
   ```bash
   cd backend
   python seed.py
   ```

---

## Fonctionnalités

### Boutique Client
- Page d'accueil avec hero animé, catégories et produits vedettes
- Liste produits avec filtrage par catégorie et recherche full-text
- Fiche produit avec galerie, sélecteur de quantité et produits similaires
- Panier latéral en temps réel (persisté en localStorage)
- Formulaire de commande (nom, téléphone, ville)
- Sélection paiement : Wave, Orange Money, Livraison
- Page de confirmation avec récapitulatif et téléchargement de facture PDF

### Administration
- Dashboard avec statistiques (CA, commandes, stock, en attente)
- Liste produits avec gestion stock (couleur selon niveau)
- Ajout/modification/suppression de produits
- Upload d'images (local) ou URL externe
- Liste des commandes avec vue détaillée dépliable
- Changement de statut de commande en un clic
- Téléchargement facture PDF par commande

---

## Design

Palette de couleurs :
- **Blanc** — fond principal `#FFFFFF`
- **Beige clair** — sections alternées `#F5F0E8`
- **Rose poudré** — accents `#F4B8C1`
- **Noir élégant** — titres et boutons `#1A1A1A`

Typographie : Inter (sans-serif) + Georgia (serif pour les titres)

---

Développé pour **DASHA SHOP** — Mode Féminine & Accessoires de Luxe
