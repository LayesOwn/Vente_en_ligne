import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { getProducts, getCategories } from "../api";
import ProductCard from "../components/ProductCard";

const ALL = "Tout";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const activeCategory = searchParams.get("category") || ALL;
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [inputValue, setInputValue] = useState(search);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = {};
    if (activeCategory && activeCategory !== ALL) params.category = activeCategory;
    if (search) params.search = search;

    getProducts(params)
      .then((res) => setProducts(res.data))
      .catch((err) => setError(err?.response?.data?.detail || "Impossible de charger les produits. Vérifiez que le serveur est démarré."))
      .finally(() => setLoading(false));
  }, [activeCategory, search]);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories([ALL, ...res.data]))
      .catch(() => setCategories([ALL]));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(inputValue);
    const params = new URLSearchParams(searchParams);
    if (inputValue) params.set("search", inputValue);
    else params.delete("search");
    setSearchParams(params);
  };

  const handleCategory = (cat) => {
    const params = new URLSearchParams();
    if (cat !== ALL) params.set("category", cat);
    setSearchParams(params);
    setFilterOpen(false);
  };

  const clearFilters = () => {
    setInputValue("");
    setSearch("");
    setSearchParams({});
  };

  const hasFilters = activeCategory !== ALL || search;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-beige-50 border-b border-beige-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="section-title mb-2">Notre Boutique</h1>
          <p className="text-sm text-dasha-gray">
            {loading ? "Chargement…" : `${products.length} article${products.length > 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search + filter bar */}
        <div className="flex gap-3 mb-8">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Rechercher un produit…"
                className="input-field pl-9"
              />
            </div>
            <button type="submit" className="btn-primary px-5 text-sm">
              Chercher
            </button>
          </form>

          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="md:hidden btn-outline px-4 flex items-center gap-2"
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar catégories — desktop */}
          <aside className="hidden md:block w-48 flex-shrink-0">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
              Catégories
            </h2>
            <ul className="space-y-1">
              {categories.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => handleCategory(cat)}
                    className={`w-full text-left text-sm py-2 px-3 transition-colors ${
                      activeCategory === cat
                        ? "bg-dasha-black text-white"
                        : "text-dasha-gray hover:text-dasha-black hover:bg-beige-100"
                    }`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-xs text-gray-400 hover:text-dasha-black flex items-center gap-1 transition-colors"
              >
                <X size={12} /> Effacer les filtres
              </button>
            )}
          </aside>

          {/* Mobile filter drawer */}
          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden fixed inset-0 z-40 bg-white pt-16 px-4 overflow-auto"
              >
                <button
                  onClick={() => setFilterOpen(false)}
                  className="absolute top-4 right-4 p-2"
                >
                  <X size={22} />
                </button>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                  Catégories
                </h2>
                <ul className="space-y-1">
                  {categories.map((cat) => (
                    <li key={cat}>
                      <button
                        onClick={() => handleCategory(cat)}
                        className={`w-full text-left text-sm py-3 px-3 border-b border-gray-100 ${
                          activeCategory === cat ? "font-semibold text-dasha-black" : "text-dasha-gray"
                        }`}
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Product grid */}
          <div className="flex-1">
            {/* Active filters */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {activeCategory !== ALL && (
                  <span className="inline-flex items-center gap-1.5 bg-dasha-black text-white text-xs px-3 py-1.5">
                    {activeCategory}
                    <button onClick={() => handleCategory(ALL)}>
                      <X size={11} />
                    </button>
                  </span>
                )}
                {search && (
                  <span className="inline-flex items-center gap-1.5 bg-beige-200 text-dasha-black text-xs px-3 py-1.5">
                    "{search}"
                    <button onClick={() => { setSearch(""); setInputValue(""); }}>
                      <X size={11} />
                    </button>
                  </span>
                )}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-4">⚠️</p>
                <p className="font-serif text-xl text-dasha-black mb-2">Erreur de chargement</p>
                <p className="text-sm text-red-500 mb-6">{error}</p>
                <button onClick={fetchProducts} className="btn-outline">
                  Réessayer
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-4">🔍</p>
                <p className="font-serif text-xl text-dasha-black mb-2">Aucun produit trouvé</p>
                <p className="text-sm text-dasha-gray mb-6">Essayez une autre recherche ou catégorie</p>
                <button onClick={clearFilters} className="btn-outline">
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
              >
                {products.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
