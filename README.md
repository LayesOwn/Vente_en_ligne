# Dash-Design SHOP — Boutique E-commerce

Application web e-commerce complète pour la vente de vêtements, chaussures, sacs, bijoux et accessoires. Boutique cliente + espace d'administration, avec suivi de commande, facturation PDF et notifications WhatsApp.

🌐 En production : https://layesdev.pythonanywhere.com

---

## Stack Technique

| Couche | Technologie |
|---|---|
| Frontend | React 18 + Vite + TailwindCSS + Framer Motion + Axios |
| Backend | Python FastAPI + SQLAlchemy |
| Base de données | SQLite (compatible PostgreSQL) |
| Authentification | JWT (PyJWT, HS256) |
| PDF | ReportLab |
| Notifications | Telegram (vendeur) + WhatsApp `wa.me` (client) |
| Paiements | Wave, Orange Money, Paiement à la livraison |

---

## Structure du Projet

```
Vente_en_ligne/
├── backend/
│   ├── app/
│   │   ├── main.py            # App FastAPI, middleware sécurité, migrations, SPA
│   │   ├── database.py        # Configuration SQLAlchemy
│   │   ├── models.py          # Modèles ORM (Product, Order, OrderItem, ShopProfile)
│   │   ├── schemas.py         # Schémas Pydantic
│   │   ├── routers/
│   │   │   ├── products.py    # CRUD produits
│   │   │   ├── orders.py      # Commandes, suivi par token, facture PDF
│   │   │   └── admin.py       # Login, stats, upload images, profil boutique
│   │   └── utils/
│   │       ├── auth.py        # JWT (PyJWT)
│   │       ├── security.py    # Rate limiting in-memory
│   │       ├── pdf.py         # Génération facture PDF
│   │       └── telegram.py    # Notification commande au vendeur
│   ├── wsgi.py                # Point d'entrée PythonAnywhere (a2wsgi)
│   ├── seed.py                # Données de démonstration
│   ├── requirements.txt
│   └── .env                   # Variables d'environnement (non versionné)
├── frontend/
│   ├── src/
│   │   ├── api/index.js       # Appels API centralisés (Axios)
│   │   ├── context/
│   │   │   ├── CartContext.jsx     # Panier global (localStorage)
│   │   │   └── ProfileContext.jsx  # Profil boutique (logo, coordonnées)
│   │   ├── components/         # Navbar, Footer, ProductCard, CartDrawer…
│   │   ├── pages/
│   │   │   ├── Home.jsx, Products.jsx, ProductDetail.jsx
│   │   │   ├── Checkout.jsx, OrderConfirmation.jsx
│   │   │   └── admin/         # Login, Dashboard, AdminProducts, AddEditProduct,
│   │   │                      #   AdminOrders, AdminProfile
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── dist/                  # Build de production (versionné, servi par FastAPI)
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Installation locale

### Prérequis
- Python 3.10+ (3.12 recommandé — voir Déploiement)
- Node.js 18+

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Linux/Mac
pip install -r requirements.txt
python seed.py               # (optionnel) charge des données de démo
uvicorn app.main:app --reload --port 8000
```

### Frontend
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
| API Docs (dev uniquement) | http://localhost:8000/api/docs |

> En production, FastAPI sert directement le build `frontend/dist/` : tout est sur une seule origine (pas de CORS entre front et back).

---

## Variables d'Environnement

Fichier `backend/.env` :

```env
# Base de données
DATABASE_URL=sqlite:///./dasha_shop.db
UPLOAD_DIR=uploads

# Sécurité (OBLIGATOIRE en production)
ENVIRONMENT=production                       # active le mode prod (voir ci-dessous)
SECRET_KEY=<clé aléatoire de 64 caractères>  # min. 32 caractères
ADMIN_PASSWORD=<mot de passe admin fort>

# Frontend
FRONTEND_URL=https://votre-domaine.com

# Notifications vendeur (optionnel)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

Générer une clé secrète :
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### Comportement du mode `production`
Quand `ENVIRONMENT=production` :
- L'application **refuse de démarrer** si `ADMIN_PASSWORD` est absent ou si `SECRET_KEY` est par défaut / trop courte (< 32 caractères).
- La documentation API (`/api/docs`, `/api/redoc`, `/api/openapi.json`) est désactivée.
- L'en-tête HSTS est ajouté ; CORS est restreint à `FRONTEND_URL`.

### Migration vers PostgreSQL
Remplacer `DATABASE_URL` puis ajouter `psycopg2-binary` à `requirements.txt` :
```env
DATABASE_URL=postgresql://user:password@localhost:5432/dasha_shop
```

---

## API REST

Les routes marquées 🔒 nécessitent un jeton admin (`Authorization: Bearer <token>`).

### Produits
| Méthode | Endpoint | Accès | Description |
|---|---|---|---|
| GET | `/api/products` | public | Liste (params : `category`, `search`, `skip`, `limit`) |
| GET | `/api/products/categories` | public | Liste des catégories |
| GET | `/api/products/{id}` | public | Détail d'un produit |
| POST | `/api/products` | 🔒 | Créer un produit |
| PUT | `/api/products/{id}` | 🔒 | Modifier un produit |
| DELETE | `/api/products/{id}` | 🔒 | Supprimer un produit |

### Commandes
| Méthode | Endpoint | Accès | Description |
|---|---|---|---|
| POST | `/api/orders` | public | Créer une commande (rate-limité, total recalculé côté serveur) |
| GET | `/api/orders` | 🔒 | Lister toutes les commandes |
| GET | `/api/orders/track/{token}` | public | Suivi d'une commande via son jeton |
| GET | `/api/orders/track/{token}/invoice` | public | Facture PDF via jeton |
| GET | `/api/orders/{id}` | 🔒 | Détail d'une commande par ID |
| PUT | `/api/orders/{id}/status` | 🔒 | Changer le statut |

> Le suivi et la facture côté client utilisent un **jeton public non devinable** (`public_token`), pas l'ID séquentiel — pour éviter que les données d'un client soient accessibles en devinant les numéros.

### Admin
| Méthode | Endpoint | Accès | Description |
|---|---|---|---|
| POST | `/api/admin/login` | public | Connexion admin (rate-limité) → jeton JWT |
| GET | `/api/admin/stats` | 🔒 | Statistiques du dashboard |
| POST | `/api/admin/upload` | 🔒 | Upload d'image (max 5 Mo, validée) |
| GET | `/api/admin/profile` | public | Profil boutique (footer public) |
| PUT | `/api/admin/profile` | 🔒 | Modifier le profil boutique |

### Statuts de commande
`en_attente` · `confirmee` · `en_livraison` · `livree` · `annulee`

---

## Base de Données

### `products`
```
id, name, description, price, stock, category, image, created_at
```

### `orders`
```
id, public_token, customer_name, phone, city, payment_method, total, status, created_at
```

### `order_items`
```
id, order_id, product_id, quantity, price
```

### `shop_profile`
```
id, email, phone, facebook, instagram, tiktok, logo, about
```

> Les colonnes ajoutées après coup (`orders.public_token`, `shop_profile.logo`, `shop_profile.about`) sont créées et remplies **automatiquement au démarrage** — aucune migration manuelle nécessaire.

---

## Fonctionnalités

### Boutique cliente
- Accueil avec hero animé, catégories et produits vedettes
- Liste produits avec filtrage par catégorie et recherche
- Fiche produit avec quantité, produits similaires et **contact WhatsApp**
- Panier latéral en temps réel (persisté en localStorage)
- Commande (nom, téléphone, ville) + choix du paiement (Wave, Orange Money, Livraison)
- Page de confirmation / **suivi par jeton** avec récapitulatif et téléchargement de la facture PDF

### Administration
- Dashboard : chiffre d'affaires, commandes, stock, commandes en attente
- Produits : liste, création, modification, suppression, upload d'image ou URL
- Commandes : vue dépliable avec **photos des articles**, changement de statut, **facture PDF**
- **Envoi WhatsApp au client** : message avec récapitulatif complet + statut + lien de la facture + lien de suivi
- **Profil boutique** éditable : logo, texte « À propos », coordonnées et réseaux sociaux

### Sécurité
- Authentification admin par JWT (PyJWT, HS256), mot de passe comparé en temps constant
- Rate limiting sur la connexion et la création de commande
- Accès client aux commandes/factures par jeton non devinable (anti-IDOR)
- Upload d'images validé (type, extension, taille, magic bytes via Pillow, nom aléatoire)
- En-têtes de sécurité HTTP, protection anti path-traversal du SPA
- Vérifications de démarrage strictes en production

---

## Déploiement (PythonAnywhere)

L'application est déployée sur un compte gratuit PythonAnywhere. L'app FastAPI (ASGI) est adaptée en WSGI via `a2wsgi` dans `backend/wsgi.py`.

### Première installation
1. **Cloner le code** dans la console Bash :
   ```bash
   git clone <repo> ~/Vente_en_ligne
   ```
2. **Créer un virtualenv à la même version que l'app web** (onglet Web → « Python version »). Ici **Python 3.12** :
   ```bash
   mkvirtualenv --python=python3.12 dasha-venv
   pip install -r ~/Vente_en_ligne/backend/requirements.txt
   ```
   > ⚠️ Le venv doit correspondre à la version Python de l'app web, sinon PythonAnywhere l'ignore silencieusement.
3. **Créer `backend/.env`** avec les variables ci-dessus (`ENVIRONMENT=production`, `SECRET_KEY`, `ADMIN_PASSWORD`, `FRONTEND_URL`).
4. **Onglet Web** :
   - *Source code* : `/home/<user>/Vente_en_ligne/backend`
   - *WSGI configuration file* : importe l'app depuis `backend/wsgi.py` (`application = ASGIMiddleware(app)`)
   - *Virtualenv* : `/home/<user>/.virtualenvs/dasha-venv`
   - *Static files* : URL `/uploads/` → `/home/<user>/Vente_en_ligne/backend/uploads`
5. **Reload** l'app web.

### Mettre à jour le projet
```bash
cd ~/Vente_en_ligne
git pull origin main
workon dasha-venv
pip install -r backend/requirements.txt   # seulement si les dépendances ont changé
```
Puis onglet **Web → Reload**. Les migrations de schéma s'appliquent automatiquement au rechargement.

> Le frontend est buildé et commité dans `frontend/dist/` : un simple `git pull` le met à jour. Après un déploiement, faire `Ctrl+Shift+R` dans le navigateur pour vider le cache.

### Rebuild du frontend (après modification du front)
```bash
cd frontend
npm run build
git add dist && git commit -m "build" && git push
```

Log d'erreur : `/var/log/<user>.pythonanywhere.com.error.log`

---

## Design

Palette de couleurs :
- **Blanc** — fond principal `#FFFFFF`
- **Beige clair** — sections alternées `#F5F0E8`
- **Rose poudré** — accents `#F4B8C1`
- **Noir élégant** — titres et boutons `#1A1A1A`

Typographie : Inter (sans-serif) + serif pour les titres.

---

Développé pour **Dash-Design SHOP** — Mode & Accessoires
