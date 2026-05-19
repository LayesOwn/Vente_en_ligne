import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/index";

export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/admin/login", { password });
      localStorage.setItem("admin_token", res.data.access_token);
      navigate("/admin");
    } catch {
      setError("Mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F0E8]">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm">
        <h1 className="flex flex-col items-center leading-none mb-1">
          <span className="text-2xl font-bold text-[#1A1A1A] tracking-[0.1em]">Dash-Design</span>
          <span className="text-sm font-semibold tracking-[0.35em] text-[#F4B8C1]">SHOP</span>
        </h1>
        <p className="text-center text-[#F4B8C1] text-sm mb-8">Espace administration</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#F4B8C1]"
              placeholder="••••••••"
              autoFocus
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A1A1A] text-white py-2.5 rounded-lg font-medium hover:bg-[#333] transition disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
