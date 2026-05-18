import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { cartCount, setIsCartOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: "Accueil", to: "/" },
    { label: "Boutique", to: "/produits" },
    { label: "Vêtements", to: "/produits?category=Vêtements" },
    { label: "Accessoires", to: "/produits?category=Accessoires" },
  ];

  const isActive = (to) => location.pathname === to.split("?")[0];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <span className="text-2xl md:text-3xl font-serif font-normal tracking-[0.15em] text-dasha-black">
              DASHA
              <span className="text-rose-powder ml-1">SHOP</span>
            </span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm tracking-wide transition-colors duration-200 ${
                  isActive(link.to)
                    ? "text-dasha-black font-medium border-b border-dasha-black pb-0.5"
                    : "text-dasha-gray hover:text-dasha-black"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/produits"
              className="p-2 text-dasha-gray hover:text-dasha-black transition-colors"
              aria-label="Rechercher"
            >
              <Search size={20} />
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-dasha-gray hover:text-dasha-black transition-colors"
              aria-label="Panier"
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-rose-powder text-dasha-black text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold"
                >
                  {cartCount > 9 ? "9+" : cartCount}
                </motion.span>
              )}
            </button>

            {/* Menu mobile */}
            <button
              className="md:hidden p-2 text-dasha-gray"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 bg-white overflow-hidden"
          >
            <nav className="px-4 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm tracking-wide text-dasha-gray hover:text-dasha-black transition-colors py-1"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-gray-100 pt-4">
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="text-xs text-gray-400 hover:text-dasha-gray transition-colors"
                >
                  Admin
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
