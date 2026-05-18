"""Script de données initiales pour DASHA SHOP."""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, engine, Base
from app.models import Product

Base.metadata.create_all(bind=engine)

PRODUCTS = [
    # Vêtements
    {
        "name": "Robe Florale Élégante",
        "description": "Robe légère à motifs floraux, parfaite pour l'été. Tissu doux et respirant.",
        "price": 25000,
        "stock": 15,
        "category": "Vêtements",
        "image": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400",
    },
    {
        "name": "Blazer Rose Poudré",
        "description": "Blazer tendance coupe ajustée, idéal pour un look professionnel chic.",
        "price": 35000,
        "stock": 10,
        "category": "Vêtements",
        "image": "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400",
    },
    {
        "name": "Ensemble Coordonné Beige",
        "description": "Ensemble haut et pantalon fluide en couleur beige naturelle.",
        "price": 42000,
        "stock": 8,
        "category": "Vêtements",
        "image": "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400",
    },
    {
        "name": "Mini Jupe Plissée Noir",
        "description": "Mini jupe plissée élégante, style moderne et féminin.",
        "price": 18000,
        "stock": 20,
        "category": "Vêtements",
        "image": "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400",
    },
    # Chaussures
    {
        "name": "Escarpins Nude Talon Aiguille",
        "description": "Escarpins classiques couleur nude, talon 9 cm. Confortables et élégants.",
        "price": 28000,
        "stock": 12,
        "category": "Chaussures",
        "image": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400",
    },
    {
        "name": "Sandales Dorées Strass",
        "description": "Sandales plates ornées de strass dorés, idéales pour les soirées.",
        "price": 22000,
        "stock": 18,
        "category": "Chaussures",
        "image": "https://images.unsplash.com/photo-1596703263926-eb0762ee17e4?w=400",
    },
    {
        "name": "Bottines Cuir Marron",
        "description": "Bottines en cuir véritable à fermeture éclair, semelle compensée 4 cm.",
        "price": 45000,
        "stock": 7,
        "category": "Chaussures",
        "image": "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=400",
    },
    # Sacs
    {
        "name": "Sac à Main Beige Camel",
        "description": "Sac à main en cuir synthétique premium, fermeture magnétique, plusieurs compartiments.",
        "price": 32000,
        "stock": 14,
        "category": "Sacs",
        "image": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400",
    },
    {
        "name": "Mini Sac Bandoulière Rose",
        "description": "Mini sac tendance à bandoulière amovible, chaîne dorée.",
        "price": 19000,
        "stock": 22,
        "category": "Sacs",
        "image": "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400",
    },
    {
        "name": "Tote Bag Luxe Crème",
        "description": "Grand tote bag en toile de coton épais, poignées en cuir, parfait pour le quotidien.",
        "price": 15000,
        "stock": 25,
        "category": "Sacs",
        "image": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400",
    },
    # Bijoux
    {
        "name": "Collier Perles Délicates",
        "description": "Collier ras du cou avec perles blanches nacrées et fermoir doré.",
        "price": 12000,
        "stock": 30,
        "category": "Bijoux",
        "image": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400",
    },
    {
        "name": "Boucles d'Oreilles Dorées Créoles",
        "description": "Grandes créoles dorées, légères et confortables. Plaqué or 18 carats.",
        "price": 8500,
        "stock": 40,
        "category": "Bijoux",
        "image": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400",
    },
    {
        "name": "Bracelet Jonc Argent",
        "description": "Bracelet jonc fin en argent 925, design minimaliste et élégant.",
        "price": 9500,
        "stock": 35,
        "category": "Bijoux",
        "image": "https://images.unsplash.com/photo-1573408301185-9519f94f3a4e?w=400",
    },
    # Accessoires
    {
        "name": "Foulard Soie Imprimé",
        "description": "Foulard en soie naturelle avec imprimé fleuri, 90x90 cm.",
        "price": 16000,
        "stock": 20,
        "category": "Accessoires",
        "image": "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400",
    },
    {
        "name": "Lunettes de Soleil Cat Eye",
        "description": "Lunettes de soleil tendance monture cat eye, protection UV400.",
        "price": 13500,
        "stock": 18,
        "category": "Accessoires",
        "image": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400",
    },
    {
        "name": "Ceinture Fine Dorée",
        "description": "Ceinture fine ajustable avec boucle dorée, polyvalente et chic.",
        "price": 7500,
        "stock": 28,
        "category": "Accessoires",
        "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
    },
]


def seed():
    db = SessionLocal()
    try:
        existing = db.query(Product).count()
        if existing > 0:
            print(f"[OK] La base contient deja {existing} produits. Seed ignore.")
            return

        for data in PRODUCTS:
            product = Product(**data)
            db.add(product)

        db.commit()
        print(f"[OK] {len(PRODUCTS)} produits ajoutes avec succes !")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
