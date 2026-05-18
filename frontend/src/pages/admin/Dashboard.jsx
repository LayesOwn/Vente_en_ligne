import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, ShoppingCart, TrendingUp, Clock, Plus, Eye } from "lucide-react";
import { getStats, getOrders } from "../../api";

function StatCard({ icon, label, value, sub, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 shadow-soft"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
          <p className={`text-3xl font-bold ${color || "text-dasha-black"}`}>{value}</p>
          {sub && <p className="text-xs text-dasha-gray mt-1">{sub}</p>}
        </div>
        <div className="p-3 bg-beige-100 rounded-sm">{icon}</div>
      </div>
    </motion.div>
  );
}

const STATUS_LABELS = {
  en_attente: { label: "En attente", color: "bg-orange-100 text-orange-700" },
  confirmee: { label: "Confirmée", color: "bg-blue-100 text-blue-700" },
  en_livraison: { label: "En livraison", color: "bg-indigo-100 text-indigo-700" },
  livree: { label: "Livrée", color: "bg-green-100 text-green-700" },
  annulee: { label: "Annulée", color: "bg-red-100 text-red-700" },
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getOrders()])
      .then(([statsRes, ordersRes]) => {
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif text-dasha-black">Tableau de bord</h1>
          <p className="text-sm text-dasha-gray mt-1">Vue d'ensemble de votre boutique</p>
        </div>
        <Link to="/admin/produits/nouveau" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} /> Nouveau produit
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white animate-pulse shadow-soft" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<ShoppingCart size={20} className="text-dasha-black" />}
              label="Total commandes"
              value={stats?.total_orders ?? 0}
            />
            <StatCard
              icon={<TrendingUp size={20} className="text-green-600" />}
              label="Chiffre d'affaires"
              value={`${(stats?.total_revenue ?? 0).toLocaleString()} FCFA`}
              sub="commandes non annulées"
              color="text-green-600"
            />
            <StatCard
              icon={<Package size={20} className="text-blue-600" />}
              label="Produits"
              value={stats?.total_products ?? 0}
            />
            <StatCard
              icon={<Clock size={20} className="text-orange-500" />}
              label="En attente"
              value={stats?.pending_orders ?? 0}
              sub="à traiter"
              color="text-orange-500"
            />
          </div>

          {/* Dernières commandes */}
          <div className="bg-white shadow-soft">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-serif text-lg">Dernières commandes</h2>
              <Link to="/admin/commandes" className="text-xs text-dasha-gray hover:text-dasha-black flex items-center gap-1">
                <Eye size={13} /> Tout voir
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="text-center text-dasha-gray py-10 text-sm">Aucune commande pour l'instant</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-semibold uppercase tracking-wider text-gray-400 px-6 py-3">#</th>
                      <th className="text-left text-xs font-semibold uppercase tracking-wider text-gray-400 px-3 py-3">Client</th>
                      <th className="text-left text-xs font-semibold uppercase tracking-wider text-gray-400 px-3 py-3 hidden sm:table-cell">Ville</th>
                      <th className="text-left text-xs font-semibold uppercase tracking-wider text-gray-400 px-3 py-3">Total</th>
                      <th className="text-left text-xs font-semibold uppercase tracking-wider text-gray-400 px-3 py-3">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => {
                      const s = STATUS_LABELS[order.status] || { label: order.status, color: "bg-gray-100 text-gray-700" };
                      return (
                        <tr key={order.id} className="border-b border-gray-50 hover:bg-beige-50 transition-colors">
                          <td className="px-6 py-3 font-medium text-dasha-black">
                            DASHA-{String(order.id).padStart(4, "0")}
                          </td>
                          <td className="px-3 py-3 text-dasha-gray">{order.customer_name}</td>
                          <td className="px-3 py-3 text-dasha-gray hidden sm:table-cell">{order.city}</td>
                          <td className="px-3 py-3 font-semibold text-dasha-black">
                            {order.total.toLocaleString()} FCFA
                          </td>
                          <td className="px-3 py-3">
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.color}`}>
                              {s.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
