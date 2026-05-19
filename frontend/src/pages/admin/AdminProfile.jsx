import { useState, useEffect } from "react";
import { Instagram, Facebook, Mail, Phone, Save, Loader2 } from "lucide-react";
import { getProfile, updateProfile } from "../../api";

const FIELDS = [
  {
    key: "email",
    label: "Email",
    placeholder: "contact@dashashop.com",
    icon: <Mail size={16} />,
    type: "email",
  },
  {
    key: "phone",
    label: "Téléphone / WhatsApp",
    placeholder: "+221 77 000 00 00",
    icon: <Phone size={16} />,
    type: "tel",
  },
  {
    key: "facebook",
    label: "Facebook",
    placeholder: "https://facebook.com/dashashop",
    icon: <Facebook size={16} />,
    type: "url",
  },
  {
    key: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/dashashop",
    icon: <Instagram size={16} />,
    type: "url",
  },
  {
    key: "tiktok",
    label: "TikTok",
    placeholder: "https://tiktok.com/@dashashop",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
      </svg>
    ),
    type: "url",
  },
];

export default function AdminProfile() {
  const [form, setForm] = useState({
    email: "",
    phone: "",
    facebook: "",
    instagram: "",
    tiktok: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getProfile()
      .then((res) => {
        const data = res.data;
        setForm({
          email: data.email || "",
          phone: data.phone || "",
          facebook: data.facebook || "",
          instagram: data.instagram || "",
          tiktok: data.tiktok || "",
        });
      })
      .catch(() => setError("Impossible de charger le profil."))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setSuccess(false);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await updateProfile(form);
      setSuccess(true);
    } catch {
      setError("Erreur lors de l'enregistrement. Réessayez.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 size={28} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-gray-900">Profil de la boutique</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ces informations apparaissent dans le pied de page de la boutique.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {FIELDS.map(({ key, label, placeholder, icon, type }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {icon}
              </span>
              <input
                type={type}
                name={key}
                value={form[key]}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-white"
              />
            </div>
          </div>
        ))}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-sm px-3 py-2">
            Profil mis à jour avec succès.
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-gray-900 text-white text-sm px-5 py-2.5 rounded-sm hover:bg-gray-800 disabled:opacity-60 transition-colors"
        >
          {saving ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Save size={15} />
          )}
          Enregistrer
        </button>
      </form>
    </div>
  );
}
