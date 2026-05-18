import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowLeft, Plus, Minus, Check } from "lucide-react";
import { getProduct, getProducts } from "../api";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart, setIsCartOpen } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setAdded(false);
    setQty(1);
    getProduct(id)
      .then((res) => {
        setProduct(res.data);
        return getProducts({ category: res.data.category, limit: 4 });
      })
      .then((res) => setRelated(res.data.filter((p) => p.id !== Number(id)).slice(0, 4)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = () => {
    if (!product || product.stock === 0) return;
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setIsCartOpen(true);
    }, 800);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10">
        <div className="aspect-square bg-gray-100 animate-pulse" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-5 bg-gray-100 animate-pulse rounded" style={{ width: `${70 - i * 10}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24">
        <p className="text-xl font-serif text-dasha-black">Produit introuvable</p>
        <Link to="/produits" className="btn-outline mt-6 inline-flex">
          Retour à la boutique
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-xs text-gray-400">
          <Link to="/" className="hover:text-dasha-black transition-colors">Accueil</Link>
          <span>/</span>
          <Link to="/produits" className="hover:text-dasha-black transition-colors">Boutique</Link>
          <span>/</span>
          <Link to={`/produits?category=${product.category}`} className="hover:text-dasha-black transition-colors">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-dasha-black line-clamp-1">{product.name}</span>
        </nav>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="aspect-[4/5] bg-beige-100 overflow-hidden"
          >
            <img
              src={product.image || "https://via.placeholder.com/600x750?text=DASHA+SHOP"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Infos */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col py-4"
          >
            <Link
              to={`/produits?category=${product.category}`}
              className="text-xs font-semibold uppercase tracking-widest text-dasha-gray hover:text-dasha-black transition-colors mb-3"
            >
              {product.category}
            </Link>

            <h1 className="text-3xl md:text-4xl font-serif font-normal text-dasha-black mb-4 leading-tight">
              {product.name}
            </h1>

            <p className="text-2xl font-semibold text-dasha-black mb-6">
              {product.price.toLocaleString()} FCFA
            </p>

            {product.description && (
              <p className="text-sm text-dasha-gray leading-relaxed mb-8 border-t border-beige-200 pt-6">
                {product.description}
              </p>
            )}

            {/* Stock */}
            <div className="mb-6">
              {isOutOfStock ? (
                <span className="text-sm text-red-500 font-medium">Rupture de stock</span>
              ) : product.stock <= 5 ? (
                <span className="text-sm text-orange-500 font-medium">
                  Plus que {product.stock} en stock !
                </span>
              ) : (
                <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                  <Check size={14} /> En stock
                </span>
              )}
            </div>

            {/* Quantity */}
            {!isOutOfStock && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm text-dasha-gray">Quantité</span>
                <div className="flex items-center border border-gray-200">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="p-2.5 hover:bg-beige-100 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-5 text-sm font-medium">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    className="p-2.5 hover:bg-beige-100 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleAdd}
              disabled={isOutOfStock || added}
              className={`btn-primary flex items-center justify-center gap-2 text-base py-4 mb-4 transition-all ${
                added ? "bg-green-600 hover:bg-green-600" : ""
              }`}
            >
              {added ? (
                <>
                  <Check size={18} /> Ajouté au panier !
                </>
              ) : (
                <>
                  <ShoppingBag size={18} />
                  {isOutOfStock ? "Rupture de stock" : "Ajouter au panier"}
                </>
              )}
            </button>

            {/* Paiements */}
            <div className="border-t border-beige-200 pt-6 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Modes de paiement
              </p>
              {["💙 Wave", "🟠 Orange Money", "🚚 Paiement à la livraison"].map((m) => (
                <p key={m} className="text-sm text-dasha-gray">{m}</p>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Produits similaires */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="section-title mb-8">Vous aimerez aussi</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
