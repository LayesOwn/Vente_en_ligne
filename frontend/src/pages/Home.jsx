import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Truck, RefreshCw, Shield } from "lucide-react";
import { getProducts } from "../api";
import ProductCard from "../components/ProductCard";

const CATEGORIES = [
  { name: "Vêtements", icon: "👗", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400" },
  { name: "Chaussures", icon: "👠", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400" },
  { name: "Sacs", icon: "👜", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400" },
  { name: "Bijoux", icon: "💍", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400" },
  { name: "Accessoires", icon: "🕶️", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400" },
];

const PROMISES = [
  { icon: <Truck size={22} />, title: "Livraison rapide", desc: "Partout au Sénégal" },
  { icon: <RefreshCw size={22} />, title: "Retours faciles", desc: "Sous 7 jours" },
  { icon: <Shield size={22} />, title: "Paiement sécurisé", desc: "Wave & Orange Money" },
];

function fadeIn(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5, delay },
  };
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ limit: 8 })
      .then((res) => setFeatured(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex items-center bg-beige-100 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1558171813-2f253e0eeb44?w=1400"
            alt="DASHA SHOP Hero"
            className="w-full h-full object-cover object-top opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/50 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-xl"
          >
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-rose-medium mb-4">
              Nouvelle Collection 2025
            </p>
            <h1 className="text-5xl md:text-6xl font-serif font-normal leading-tight text-dasha-black mb-6">
              L'Élégance
              <br />
              au Féminin
            </h1>
            <p className="text-lg text-dasha-gray leading-relaxed mb-10 max-w-md">
              Découvrez une sélection exclusive de vêtements, chaussures, sacs et
              bijoux pensés pour la femme moderne et raffinée.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/produits" className="btn-primary flex items-center justify-center gap-2">
                Explorer la boutique
                <ArrowRight size={16} />
              </Link>
              <Link to="/produits?category=Nouveautés" className="btn-outline flex items-center justify-center gap-2">
                Nouveautés
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Promesses ──────────────────────────────────────────────── */}
      <section className="bg-dasha-black text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            {PROMISES.map(({ icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 px-6 py-4 justify-center">
                <span className="text-rose-powder">{icon}</span>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Catégories ─────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn()} className="text-center mb-12">
            <h2 className="section-title">Nos Collections</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.name} {...fadeIn(i * 0.08)}>
                <Link
                  to={`/produits?category=${cat.name}`}
                  className="group block relative overflow-hidden aspect-[3/4] bg-beige-100"
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <p className="text-lg font-serif">{cat.name}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Produits vedettes ──────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-beige-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn()} className="flex items-end justify-between mb-12">
            <h2 className="section-title">Nos Coups de Cœur</h2>
            <Link
              to="/produits"
              className="hidden md:flex items-center gap-2 text-sm text-dasha-gray hover:text-dasha-black transition-colors"
            >
              Tout voir <ArrowRight size={15} />
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featured.map((product, i) => (
                <motion.div key={product.id} {...fadeIn(i * 0.06)}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-10 md:hidden">
            <Link to="/produits" className="btn-outline">
              Voir tous les produits
            </Link>
          </div>
        </div>
      </section>

      {/* ── Banner promo ───────────────────────────────────────────── */}
      <section className="py-16 bg-rose-light">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div {...fadeIn()}>
            <p className="text-xs tracking-[0.3em] uppercase text-rose-dark mb-3">Offre spéciale</p>
            <h2 className="text-4xl md:text-5xl font-serif font-normal text-dasha-black mb-4">
              Livraison Offerte
            </h2>
            <p className="text-dasha-gray mb-8">
              Pour toute commande supérieure à <strong>50 000 FCFA</strong>
            </p>
            <Link to="/produits" className="btn-primary">
              J'en profite
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
