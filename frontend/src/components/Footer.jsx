import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { useProfile } from "../context/ProfileContext";

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
  </svg>
);

export default function Footer() {
  const profile = useProfile();

  const socials = [
    profile?.instagram && {
      icon: <Instagram size={18} />,
      label: "Instagram",
      href: profile.instagram,
    },
    profile?.facebook && {
      icon: <Facebook size={18} />,
      label: "Facebook",
      href: profile.facebook,
    },
    profile?.tiktok && {
      icon: <TikTokIcon />,
      label: "TikTok",
      href: profile.tiktok,
    },
  ].filter(Boolean);

  const contacts = [
    profile?.email && {
      icon: <Mail size={14} />,
      label: profile.email,
      href: `mailto:${profile.email}`,
    },
    profile?.phone && {
      icon: <Phone size={14} />,
      label: profile.phone,
      href: `tel:${profile.phone.replace(/\s/g, "")}`,
    },
    { icon: <MapPin size={14} />, label: "Dakar, Sénégal", href: null },
  ].filter(Boolean);

  return (
    <footer className="bg-dasha-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand + réseaux sociaux */}
          <div>
            <div className="flex flex-col leading-none mb-4">
              <span className="text-2xl font-serif tracking-[0.12em]">Dash-Design</span>
              <span className="text-sm font-serif tracking-[0.35em] text-rose-powder">SHOP</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Mode et accessoires pour tous les styles. Élégance, modernité et
              raffinement au quotidien.
            </p>
            {socials.length > 0 && (
              <div className="flex items-center gap-3">
                {socials.map(({ icon, label, href }) => (
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
            )}
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
              {contacts.map(({ icon, label, href }) => (
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
            © {new Date().getFullYear()} Dash-Design SHOP — Tous droits réservés
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
