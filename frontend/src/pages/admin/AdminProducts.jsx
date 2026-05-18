import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Package, AlertTriangle } from "lucide-react";
import { getProducts, deleteProduct } from "../../api";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    getProducts({ limit: 200 })
      .then((res) => setProducts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteId);
      setProducts((prev) => prev.filter((p) => p.id !== deleteId));
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur lors de la suppression");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif text-dasha-black">Produits</h1>
          <p className="text-sm text-dasha-gray mt-1">{products.length} produit(s) au catalogue</p>
        </div>
        <Link to="/admin/produits/nouveau" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} /> Ajouter un produit
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white animate-pulse shadow-soft" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white shadow-soft">
          <Package size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="font-serif text-xl text-dasha-black mb-2">Aucun produit</p>
          <p className="text-sm text-dasha-gray mb-6">Commencez par ajouter vos premiers produits</p>
          <Link to="/admin/produits/nouveau" className="btn-primary">
            Ajouter un produit
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-beige-50">
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-gray-400 px-4 py-3">Produit</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-gray-400 px-3 py-3 hidden md:table-cell">Catégorie</th>
                  <th className="text-right text-xs font-semibold uppercase tracking-wider text-gray-400 px-3 py-3">Prix</th>
                  <th className="text-right text-xs font-semibold uppercase tracking-wider text-gray-400 px-3 py-3">Stock</th>
                  <th className="text-right text-xs font-semibold uppercase tracking-wider text-gray-400 px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-50 hover:bg-beige-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image || "https://via.placeholder.com/40x40?text=IMG"}
                          alt={product.name}
                          className="w-10 h-10 object-cover bg-beige-100 flex-shrink-0"
                        />
                        <span className="font-medium text-dasha-black line-clamp-1">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-dasha-gray hidden md:table-cell">
                      {product.category}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-dasha-black">
                      {product.price.toLocaleString()} FCFA
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span
                        className={`font-semibold ${
                          product.stock === 0
                            ? "text-red-500"
                            : product.stock <= 5
                            ? "text-orange-500"
                            : "text-green-600"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/produits/${product.id}/modifier`}
                          className="p-2 text-dasha-gray hover:text-dasha-black transition-colors"
                          title="Modifier"
                        >
                          <Edit2 size={15} />
                        </Link>
                        <button
                          onClick={() => setDeleteId(product.id)}
                          className="p-2 text-dasha-gray hover:text-red-500 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal confirmation suppression */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white p-8 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle size={24} className="text-red-500" />
                <h3 className="font-serif text-xl text-dasha-black">Confirmer la suppression</h3>
              </div>
              <p className="text-sm text-dasha-gray mb-6">
                Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="btn-outline flex-1"
                  disabled={deleting}
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-600 text-white px-6 py-3 font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleting ? "Suppression…" : "Supprimer"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
