import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { createOrder } from "../api";

const PAYMENT_METHODS = [
  { id: "wave", label: "Wave", icon: "💙", desc: "Paiement mobile Wave" },
  { id: "orange_money", label: "Orange Money", icon: "🟠", desc: "Paiement mobile Orange" },
  { id: "livraison", label: "À la livraison", icon: "🚚", desc: "Payez à la réception" },
];

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    city: "",
    payment_method: "livraison",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      setError("Votre panier est vide.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderData = {
        ...form,
        total: cartTotal,
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      const res = await createOrder(orderData);
      clearCart();
      navigate(`/confirmation/${res.data.id}`);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Une erreur est survenue. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <ShoppingBag size={56} className="text-gray-200" />
        <div className="text-center">
          <p className="font-serif text-2xl text-dasha-black mb-2">Votre panier est vide</p>
          <p className="text-dasha-gray text-sm mb-6">Ajoutez des articles avant de commander</p>
          <Link to="/produits" className="btn-primary">
            Explorer la boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          to="/produits"
          className="inline-flex items-center gap-2 text-sm text-dasha-gray hover:text-dasha-black mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Continuer mes achats
        </Link>

        <h1 className="section-title mb-10">Finaliser ma commande</h1>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Formulaire */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="lg:col-span-3 space-y-6"
          >
            {/* Infos client */}
            <div className="bg-white p-6 shadow-soft">
              <h2 className="font-serif text-lg mb-5">Vos informations</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    value={form.customer_name}
                    onChange={handleChange}
                    placeholder="Votre nom et prénom"
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Ex: 77 123 45 67"
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                    Ville *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Ex: Dakar, Thiès, Saint-Louis…"
                    required
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Paiement */}
            <div className="bg-white p-6 shadow-soft">
              <h2 className="font-serif text-lg mb-5">Mode de paiement</h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-4 p-4 border cursor-pointer transition-all ${
                      form.payment_method === method.id
                        ? "border-dasha-black bg-beige-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={method.id}
                      checked={form.payment_method === method.id}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-dasha-black">{method.label}</p>
                      <p className="text-xs text-dasha-gray">{method.desc}</p>
                    </div>
                    <div
                      className={`ml-auto w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                        form.payment_method === method.id
                          ? "border-dasha-black bg-dasha-black"
                          : "border-gray-300"
                      }`}
                    />
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-base"
            >
              {loading ? "Envoi en cours…" : "Confirmer ma commande"}
            </button>
          </motion.form>

          {/* Récapitulatif */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white p-6 shadow-soft sticky top-24">
              <h2 className="font-serif text-lg mb-5">Récapitulatif</h2>

              <ul className="space-y-4 mb-6">
                {cart.map((item) => (
                  <li key={item.id} className="flex gap-3">
                    <img
                      src={item.image || "https://via.placeholder.com/60x60"}
                      alt={item.name}
                      className="w-14 h-14 object-cover bg-beige-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dasha-black line-clamp-2 leading-snug">
                        {item.name}
                      </p>
                      <p className="text-xs text-dasha-gray mt-1">
                        {item.quantity} × {item.price.toLocaleString()} FCFA
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-dasha-black flex-shrink-0">
                      {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="border-t border-beige-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-dasha-gray">
                  <span>Sous-total</span>
                  <span>{cartTotal.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm text-dasha-gray">
                  <span>Livraison</span>
                  <span className="text-green-600">À calculer</span>
                </div>
                <div className="flex justify-between font-semibold text-base text-dasha-black pt-2 border-t border-beige-200">
                  <span>Total</span>
                  <span>{cartTotal.toLocaleString()} FCFA</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
