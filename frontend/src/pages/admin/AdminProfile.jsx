import { useState, useEffect, useRef } from "react";
import { Instagram, Facebook, Mail, Phone, Save, Loader2, ImagePlus, X } from "lucide-react";
import { getProfile, updateProfile, uploadImage } from "../../api";

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
    logo: "",
    about: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const logoInputRef = useRef(null);

  useEffect(() => {
    getProfile()
      .then((res) => {
        const d = res.data;
        setForm({
          email: d.email || "",
          phone: d.phone || "",
          facebook: d.facebook || "",
          instagram: d.instagram || "",
          tiktok: d.tiktok || "",
          logo: d.logo || "",
          about: d.about || "",
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

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const res = await uploadImage(file);
      setForm((f) => ({ ...f, logo: res.data.url }));
    } catch {
      setError("Erreur lors du chargement du logo.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
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
          Ces informations apparaissent dans la boutique (pied de page, pages produits…).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Logo ── */}
        <div>
          <p className="block text-sm font-medium text-gray-700 mb-2">Logo de la boutique</p>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 border border-gray-200 rounded-sm bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
              {form.logo ? (
                <img src={form.logo} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <ImagePlus size={28} className="text-gray-300" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                ref={logoInputRef}
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 text-sm border border-gray-300 px-3 py-2 rounded-sm hover:bg-gray-50 disabled:opacity-60 transition-colors"
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
                {uploading ? "Chargement…" : "Choisir un logo"}
              </button>
              {form.logo && (
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, logo: "" }))}
                  className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors"
                >
                  <X size={12} /> Supprimer le logo
                </button>
              )}
              <p className="text-xs text-gray-400">JPG, PNG ou WEBP — max 5 Mo</p>
            </div>
          </div>
        </div>

        {/* ── À propos ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            À propos de la boutique
          </label>
          <textarea
            name="about"
            value={form.about}
            onChange={handleChange}
            rows={4}
            placeholder="Styliste - Modéliste - Accessoiriste. Décrivez votre activité, votre style, vos valeurs…"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-white resize-y"
          />
        </div>

        {/* ── Coordonnées & réseaux ── */}
        <div className="border-t border-gray-100 pt-6 space-y-5">
          <p className="text-sm font-semibold text-gray-700">Coordonnées & réseaux sociaux</p>
          {FIELDS.map(({ key, label, placeholder, icon, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
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
        </div>

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
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Enregistrer
        </button>
      </form>
    </div>
  );
}
