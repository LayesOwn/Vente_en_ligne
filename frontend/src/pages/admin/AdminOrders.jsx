import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, ChevronDown, ChevronUp, ShoppingCart } from "lucide-react";
import { getOrders, updateOrderStatus, getInvoiceUrl } from "../../api";

const STATUSES = [
  { value: "en_attente", label: "En attente", color: "bg-orange-100 text-orange-700" },
  { value: "confirmee", label: "Confirmée", color: "bg-blue-100 text-blue-700" },
  { value: "en_livraison", label: "En livraison", color: "bg-indigo-100 text-indigo-700" },
  { value: "livree", label: "Livrée", color: "bg-green-100 text-green-700" },
  { value: "annulee", label: "Annulée", color: "bg-red-100 text-red-700" },
];

const PAYMENT_MAP = {
  wave: "💙 Wave",
  orange_money: "🟠 Orange Money",
  livraison: "🚚 Livraison",
};

function StatusBadge({ status }) {
  const s = STATUSES.find((s) => s.value === status) || { label: status, color: "bg-gray-100 text-gray-600" };
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.color}`}>
      {s.label}
    </span>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    getOrders()
      .then((res) => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: res.data.status } : o))
      );
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur lors de la mise à jour");
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-dasha-black">Commandes</h1>
        <p className="text-sm text-dasha-gray mt-1">
          {orders.length} commande(s) au total
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-white animate-pulse shadow-soft" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white shadow-soft">
          <ShoppingCart size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="font-serif text-xl text-dasha-black mb-2">Aucune commande</p>
          <p className="text-sm text-dasha-gray">Les commandes apparaîtront ici</p>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              layout
              className="bg-white shadow-soft overflow-hidden"
            >
              {/* Ligne principale */}
              <div
                className="flex items-center gap-3 px-4 py-4 cursor-pointer hover:bg-beige-50 transition-colors"
                onClick={() => toggleExpand(order.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-semibold text-sm text-dasha-black">
                      DASHA-{String(order.id).padStart(4, "0")}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-dasha-gray mt-0.5">
                    {order.customer_name} · {order.city} ·{" "}
                    {new Date(order.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-dasha-black text-sm">
                    {order.total.toLocaleString()} FCFA
                  </p>
                  <p className="text-xs text-dasha-gray">
                    {PAYMENT_MAP[order.payment_method] || order.payment_method}
                  </p>
                </div>

                <div className="text-dasha-gray flex-shrink-0">
                  {expandedId === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {/* Détails étendus */}
              <AnimatePresence>
                {expandedId === order.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-beige-100 overflow-hidden"
                  >
                    <div className="px-4 py-4 bg-beige-50">
                      {/* Infos client */}
                      <div className="grid sm:grid-cols-3 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Client</p>
                          <p className="font-medium text-dasha-black">{order.customer_name}</p>
                          <p className="text-dasha-gray">{order.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Livraison</p>
                          <p className="font-medium text-dasha-black">{order.city}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Date</p>
                          <p className="text-dasha-black">
                            {new Date(order.created_at).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Articles */}
                      {order.items && order.items.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                            Articles ({order.items.length})
                          </p>
                          <ul className="space-y-2">
                            {order.items.map((item) => (
                              <li
                                key={item.id}
                                className="flex items-center gap-3 bg-white p-2 rounded shadow-soft"
                              >
                                <img
                                  src={item.product?.image || "https://via.placeholder.com/80x80?text=IMG"}
                                  alt={item.product?.name || "Produit"}
                                  className="w-14 h-14 object-cover rounded flex-shrink-0 bg-beige-50"
                                  onError={(e) => {
                                    e.currentTarget.src = "https://via.placeholder.com/80x80?text=IMG";
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-dasha-black truncate">
                                    {item.product?.name || `Produit #${item.product_id}`}
                                  </p>
                                  {item.product?.category && (
                                    <p className="text-xs text-dasha-gray">{item.product.category}</p>
                                  )}
                                  <p className="text-xs text-dasha-gray mt-0.5">
                                    {item.price.toLocaleString()} FCFA × {item.quantity}
                                  </p>
                                </div>
                                <span className="font-semibold text-sm text-dasha-black flex-shrink-0">
                                  {(item.price * item.quantity).toLocaleString()} FCFA
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div>
                          <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">
                            Changer le statut
                          </label>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            disabled={updatingId === order.id}
                            className="input-field text-sm py-2 w-auto cursor-pointer"
                          >
                            {STATUSES.map((s) => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex-1 flex justify-end">
                          <a
                            href={getInvoiceUrl(order.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-outline text-xs flex items-center gap-2 py-2"
                          >
                            <Download size={13} />
                            Facture PDF
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
