import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-dasha-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <h2 className="text-2xl font-serif tracking-[0.15em] mb-4">
              DASHA<span className="text-rose-powder ml-1">SHOP</span>
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Mode féminine et accessoires de luxe. Élégance, modernité et
              raffinement au quotidien.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">
              Collections
            </h3>
            <ul className="space-y-2">
              {["Vêtements", "Chaussures", "Sacs", "Bijoux", "Accessoires"].map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/produits?category=${cat}`}
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Infos */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">
              Paiements acceptés
            </h3>
            <div className="flex flex-col gap-2">
              {[
                { label: "Wave", icon: "💙" },
                { label: "Orange Money", icon: "🟠" },
                { label: "Paiement à la livraison", icon: "🚪" },
              ].map(({ label, icon }) => (
                <span key={label} className="text-sm text-gray-300 flex items-center gap-2">
                  <span>{icon}</span>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} DASHA SHOP — Tous droits réservés
          </p>
          <Link
            to="/admin"
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            Administration
          </Link>
        </div>
      </div>
    </footer>
  );
}
