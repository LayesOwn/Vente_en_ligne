import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, X } from "lucide-react";
import { getProduct, createProduct, updateProduct, uploadImage } from "../../api";

const CATEGORIES = ["Vêtements", "Chaussures", "Sacs", "Bijoux", "Accessoires"];

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "Vêtements",
  image: "",
};

export default function AddEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    setFetchLoading(true);
    getProduct(id)
      .then((res) => {
        const p = res.data;
        setForm({
          name: p.name,
          description: p.description || "",
          price: String(p.price),
          stock: String(p.stock),
          category: p.category,
          image: p.image || "",
        });
      })
      .catch(() => setError("Impossible de charger le produit"))
      .finally(() => setFetchLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadImage(file);
      setForm((prev) => ({ ...prev, image: res.data.url }));
    } catch {
      setError("Erreur lors de l'upload de l'image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      category: form.category,
      image: form.image || null,
    };

    if (isNaN(payload.price) || isNaN(payload.stock)) {
      setError("Le prix et le stock doivent être des nombres valides.");
      setLoading(false);
      return;
    }

    try {
      if (isEdit) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }
      navigate("/admin/produits");
    } catch (err) {
      setError(err.response?.data?.detail || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-dasha-black border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/admin/produits"
          className="p-2 text-dasha-gray hover:text-dasha-black transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-serif text-dasha-black">
            {isEdit ? "Modifier le produit" : "Nouveau produit"}
          </h1>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white shadow-soft p-6 md:p-8 space-y-6"
      >
        {/* Nom */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Nom du produit *
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Ex: Robe Florale Été"
            className="input-field"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Décrivez le produit…"
            className="input-field resize-none"
          />
        </div>

        {/* Prix et Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Prix (FCFA) *
            </label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
              min="0"
              step="100"
              placeholder="25000"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Stock *
            </label>
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              required
              min="0"
              placeholder="10"
              className="input-field"
            />
          </div>
        </div>

        {/* Catégorie */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Catégorie *
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="input-field bg-white cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Image */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Image
          </label>

          {/* Upload fichier */}
          <label className="flex items-center gap-2 border border-dashed border-gray-300 p-4 cursor-pointer hover:border-dasha-black transition-colors mb-3">
            <Upload size={16} className="text-dasha-gray" />
            <span className="text-sm text-dasha-gray">
              {uploading ? "Upload en cours…" : "Cliquer pour uploader une image"}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="sr-only"
              disabled={uploading}
            />
          </label>

          {/* Ou URL directe */}
          <input
            type="url"
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="Ou coller une URL d'image…"
            className="input-field"
          />

          {/* Aperçu */}
          {form.image && (
            <div className="mt-3 relative inline-block">
              <img
                src={form.image}
                alt="Aperçu"
                className="w-24 h-24 object-cover border border-beige-200"
              />
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, image: "" }))}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
            {error}
          </div>
        )}

        <div className="flex gap-4 pt-2">
          <Link to="/admin/produits" className="btn-outline flex-1 text-center">
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading || uploading}
            className="btn-primary flex-1"
          >
            {loading ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer le produit"}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
