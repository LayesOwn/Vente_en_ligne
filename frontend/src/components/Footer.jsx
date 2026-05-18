import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";

// ── Réseaux sociaux — à compléter par Aida ──────────────────────────────────
const SOCIALS = [
  { icon: <Instagram size={18} />, label: "Instagram", href: "#" },
  { icon: <Facebook  size={18} />, label: "Facebook",  href: "#" },
  { icon: <Twitter   size={18} />, label: "Twitter",   href: "#" },
  { icon: <Youtube   size={18} />, label: "YouTube",   href: "#" },
];

// ── Informations de contact — à compléter par Aida ──────────────────────────
const CONTACT = [
  { icon: <Mail    size={14} />, label: "votre@email.com",      href: "mailto:votre@email.com" },
  { icon: <Phone   size={14} />, label: "+221 XX XXX XX XX",    href: "tel:+221XXXXXXXXX" },
  { icon: <MapPin  size={14} />, label: "Dakar, Sénégal",       href: null },
];

export default function Footer() {
  return (
    <footer className="bg-dasha-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand + réseaux sociaux */}
          <div>
            <h2 className="text-2xl font-serif tracking-[0.15em] mb-4">
              DASHA<span className="text-rose-powder ml-1">SHOP</span>
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Mode et accessoires pour tous les styles. Élégance, modernité et
              raffinement au quotidien.
            </p>
            <div className="flex items-center gap-3">
              {SOCIALS.map(({ icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/50 transition-colors"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Collections */}
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

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              {CONTACT.map(({ icon, label, href }) => (
                <li key={label}>
                  {href ? (
                    <a
                      href={href}
                      className="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <span className="text-gray-500">{icon}</span>
                      {label}
                    </a>
                  ) : (
                    <span className="text-sm text-gray-300 flex items-center gap-2">
                      <span className="text-gray-500">{icon}</span>
                      {label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Paiements */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">
              Paiements acceptés
            </h3>
            <div className="flex flex-col gap-2">
              {[
                { label: "Wave",                    icon: "💙" },
                { label: "Orange Money",            icon: "🟠" },
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
