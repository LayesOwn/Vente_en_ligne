import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShoppingBag, Eye } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart, setIsCartOpen } = useCart();

  const handleAdd = (e) => {
    e.preventDefault();
    addToCart(product, 1);
    setIsCartOpen(true);
  };

  const isOutOfStock = product.stock === 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white shadow-soft hover:shadow-hover transition-shadow duration-300"
    >
      {/* Image */}
      <Link to={`/produits/${product.id}`} className="block overflow-hidden">
        <div className="relative aspect-[3/4] bg-beige-100 overflow-hidden">
          <img
            src={product.image || "https://via.placeholder.com/300x400?text=DASHA+SHOP"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isOutOfStock && (
              <span className="badge bg-dasha-black text-white text-xs">
                Épuisé
              </span>
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <span className="badge bg-rose-powder text-dasha-black text-xs">
                Presque épuisé
              </span>
            )}
          </div>

          {/* Actions overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <div className="flex gap-2">
                <Link
                  to={`/produits/${product.id}`}
                  className="flex-1 bg-white text-dasha-black text-xs font-medium py-2.5 flex items-center justify-center gap-1.5 hover:bg-beige-100 transition-colors"
                >
                  <Eye size={14} />
                  Voir
                </Link>
                <button
                  onClick={handleAdd}
                  disabled={isOutOfStock}
                  className="flex-1 bg-dasha-black text-white text-xs font-medium py-2.5 flex items-center justify-center gap-1.5 hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag size={14} />
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Infos */}
      <div className="p-3">
        <Link to={`/produits/${product.id}`}>
          <p className="text-xs text-dasha-gray uppercase tracking-wider mb-1">
            {product.category}
          </p>
          <h3 className="text-sm font-medium text-dasha-black leading-snug line-clamp-2 hover:underline">
            {product.name}
          </h3>
          <p className="mt-2 text-base font-semibold text-dasha-black">
            {product.price.toLocaleString()} FCFA
          </p>
        </Link>
      </div>
    </motion.div>
  );
}
