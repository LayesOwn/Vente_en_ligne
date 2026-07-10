import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Download, Home, ShoppingBag } from "lucide-react";
import { trackOrder, getInvoiceUrl } from "../api";

const STATUS_MAP = {
  en_attente: { label: "En attente de confirmation", color: "text-orange-500" },
  confirmee: { label: "Confirmée", color: "text-blue-600" },
  en_livraison: { label: "En cours de livraison", color: "text-indigo-600" },
  livree: { label: "Livrée", color: "text-green-600" },
  annulee: { label: "Annulée", color: "text-red-500" },
};

const PAYMENT_MAP = {
  wave: "💙 Wave",
  orange_money: "🟠 Orange Money",
  livraison: "🚚 Paiement à la livraison",
};

export default function OrderConfirmation() {
  const { orderId: token } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackOrder(token)
      .then((res) => setOrder(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-dasha-black border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-24">
        <p className="font-serif text-xl">Commande introuvable</p>
        <Link to="/" className="btn-outline mt-6 inline-flex">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  const status = STATUS_MAP[order.status] || { label: order.status, color: "text-gray-600" };

  return (
    <div className="min-h-screen bg-beige-50 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white shadow-card p-8 md:p-12 text-center"
        >
          {/* Icône succès */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="flex justify-center mb-6"
          >
            <CheckCircle size={64} className="text-green-500" />
          </motion.div>

          <h1 className="font-serif text-3xl text-dasha-black mb-2">
            Merci pour votre commande !
          </h1>
          <p className="text-dasha-gray mb-8">
            Votre commande{" "}
            <span className="font-semibold text-dasha-black">
              N° DASHA-{String(order.id).padStart(4, "0")}
            </span>{" "}
            a bien été reçue.
          </p>

          {/* Détails commande */}
          <div className="bg-beige-50 p-6 text-left mb-8 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-dasha-gray">Client</span>
              <span className="font-medium text-dasha-black">{order.customer_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dasha-gray">Téléphone</span>
              <span className="font-medium text-dasha-black">{order.phone}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dasha-gray">Ville</span>
              <span className="font-medium text-dasha-black">{order.city}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dasha-gray">Paiement</span>
              <span className="font-medium text-dasha-black">
                {PAYMENT_MAP[order.payment_method] || order.payment_method}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dasha-gray">Statut</span>
              <span className={`font-semibold ${status.color}`}>{status.label}</span>
            </div>
            <div className="border-t border-beige-200 pt-3 flex justify-between">
              <span className="font-semibold text-dasha-black">Total</span>
              <span className="font-bold text-xl text-dasha-black">
                {order.total.toLocaleString()} FCFA
              </span>
            </div>
          </div>

          {/* Articles */}
          {order.items && order.items.length > 0 && (
            <div className="text-left mb-8">
              <h3 className="font-serif text-base mb-3 text-dasha-gray">Articles commandés</h3>
              <ul className="space-y-2">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between text-sm border-b border-beige-100 pb-2">
                    <span className="text-dasha-black">
                      {item.product?.name || `Produit #${item.product_id}`}
                      <span className="text-dasha-gray ml-1">× {item.quantity}</span>
                    </span>
                    <span className="text-dasha-black font-medium">
                      {(item.price * item.quantity).toLocaleString()} FCFA
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={getInvoiceUrl(order.public_token)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Télécharger la facture
            </a>
            <Link to="/produits" className="btn-rose flex items-center justify-center gap-2">
              <ShoppingBag size={16} />
              Continuer mes achats
            </Link>
            <Link to="/" className="btn-outline flex items-center justify-center gap-2">
              <Home size={16} />
              Accueil
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
