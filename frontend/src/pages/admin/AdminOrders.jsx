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

// Messages WhatsApp pré-rédigés envoyés au client selon le statut
const STATUS_MESSAGES = {
  en_attente: (num) =>
    `Bonjour, nous avons bien reçu votre commande ${num} ✅. Elle est en attente de confirmation. Merci pour votre confiance ! — Dash-Design SHOP`,
  confirmee: (num) =>
    `Bonjour, votre commande ${num} est confirmée ✅ et en cours de préparation. Nous vous tiendrons informé(e) de la livraison. — Dash-Design SHOP`,
  en_livraison: (num) =>
    `Bonjour, votre commande ${num} est en route 🚚 ! Notre livreur vous contactera très bientôt. — Dash-Design SHOP`,
  livree: (num) =>
    `Bonjour, votre commande ${num} a bien été livrée 🎉. Merci pour votre achat, à très bientôt ! — Dash-Design SHOP`,
  annulee: (num) =>
    `Bonjour, votre commande ${num} a été annulée. Pour toute question, n'hésitez pas à nous contacter. — Dash-Design SHOP`,
};

// Formate un numéro pour wa.me (ajoute l'indicatif Sénégal si numéro local)
function buildWaLink(phone, text) {
  let digits = (phone || "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 9) digits = "221" + digits; // numéro local sénégalais (77 123 45 67)
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

const PAYMENT_PLAIN = {
  wave: "Wave",
  orange_money: "Orange Money",
  livraison: "Paiement à la livraison",
};

// Compose le message WhatsApp complet envoyé au client : récap facture + statut
// + lien de téléchargement du PDF + lien de suivi.
function buildClientMessage(order) {
  const num = `DASHA-${String(order.id).padStart(4, "0")}`;
  const origin = window.location.origin;
  const statusLabel =
    (STATUSES.find((s) => s.value === order.status) || {}).label || order.status;
  const intro = STATUS_MESSAGES[order.status]
    ? STATUS_MESSAGES[order.status](num)
    : `Bonjour, voici le récapitulatif de votre commande ${num}.`;

  const lines = (order.items || [])
    .map((it) => {
      const name = it.product?.name || `Produit #${it.product_id}`;
      return `• ${name} x${it.quantity} — ${(it.price * it.quantity).toLocaleString()} FCFA`;
    })
    .join("\n");

  const invoiceUrl = `${origin}/api/orders/track/${order.public_token}/invoice`;
  const trackUrl = `${origin}/confirmation/${order.public_token}`;

  return (
    `${intro}\n\n` +
    `🧾 *Facture ${num}*\n` +
    `Statut : *${statusLabel}*\n\n` +
    `🛍 Articles :\n${lines}\n\n` +
    `💰 Total : ${order.total.toLocaleString()} FCFA\n` +
    `💳 Paiement : ${PAYMENT_PLAIN[order.payment_method] || order.payment_method}\n` +
    `📍 Livraison : ${order.city}\n\n` +
    `📄 Télécharger la facture : ${invoiceUrl}\n` +
    `🔎 Suivre ma commande : ${trackUrl}`
  );
}

const WhatsAppIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

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

                        <div className="flex-1 flex justify-end items-end gap-2">
                          {(() => {
                            const waLink = order.public_token
                              ? buildWaLink(order.phone, buildClientMessage(order))
                              : null;
                            if (!waLink) return null;
                            return (
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs flex items-center gap-2 py-2 px-3 rounded-sm text-white font-medium transition-colors"
                                style={{ backgroundColor: "#25D366" }}
                                title="Envoyer la facture et le statut au client sur WhatsApp"
                              >
                                <WhatsAppIcon />
                                Envoyer la facture
                              </a>
                            );
                          })()}
                          <a
                            href={getInvoiceUrl(order.public_token)}
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
