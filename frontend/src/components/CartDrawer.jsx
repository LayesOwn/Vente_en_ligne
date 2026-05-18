import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/40 z-50"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-dasha-black" />
                <h2 className="font-serif text-lg">Mon Panier</h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 text-dasha-gray hover:text-dasha-black transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <ShoppingBag size={48} className="text-gray-200" />
                  <div>
                    <p className="font-serif text-lg text-dasha-black mb-1">
                      Votre panier est vide
                    </p>
                    <p className="text-sm text-dasha-gray">
                      Découvrez nos collections
                    </p>
                  </div>
                  <Link
                    to="/produits"
                    onClick={() => setIsCartOpen(false)}
                    className="btn-outline text-sm"
                  >
                    Voir la boutique
                  </Link>
                </div>
              ) : (
                <ul className="space-y-4">
                  {cart.map((item) => (
                    <motion.li
                      key={item.id}
                      layout
                      exit={{ opacity: 0, x: 20 }}
                      className="flex gap-3"
                    >
                      <img
                        src={item.image || "https://via.placeholder.com/80x80?text=Image"}
                        alt={item.name}
                        className="w-20 h-20 object-cover flex-shrink-0 bg-beige-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-dasha-black leading-tight line-clamp-2 mb-1">
                          {item.name}
                        </p>
                        <p className="text-sm text-dasha-gray mb-2">
                          {item.price.toLocaleString()} FCFA
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 border border-gray-200 flex items-center justify-center text-sm hover:border-dasha-black transition-colors"
                          >
                            −
                          </button>
                          <span className="text-sm w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 border border-gray-200 flex items-center justify-center text-sm hover:border-dasha-black transition-colors"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="ml-auto p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="px-6 py-5 border-t border-gray-100 bg-beige-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-serif text-base">Total</span>
                  <span className="font-semibold text-lg text-dasha-black">
                    {cartTotal.toLocaleString()} FCFA
                  </span>
                </div>
                <Link
                  to="/commande"
                  onClick={() => setIsCartOpen(false)}
                  className="btn-primary w-full text-center flex items-center justify-center gap-2"
                >
                  Commander
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
