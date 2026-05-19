import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, ArrowLeft, Menu, X, LogOut, UserCircle } from "lucide-react";
import { useState } from "react";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: <LayoutDashboard size={18} />, exact: true },
  { to: "/admin/produits", label: "Produits", icon: <Package size={18} /> },
  { to: "/admin/commandes", label: "Commandes", icon: <ShoppingCart size={18} /> },
  { to: "/admin/profil", label: "Profil boutique", icon: <UserCircle size={18} /> },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
  }

  const isActive = (to, exact) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="px-6 py-6 border-b border-gray-800">
        <Link to="/" className="block">
          <span className="text-xl font-serif tracking-[0.12em] text-white">
            DASHA<span className="text-rose-powder ml-1">SHOP</span>
          </span>
        </Link>
        <p className="text-xs text-gray-500 mt-1 tracking-wider">Administration</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ to, label, icon, exact }) => (
          <Link
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-sm transition-colors ${
              isActive(to, exact)
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {icon}
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-gray-800 space-y-2">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Retour à la boutique
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-red-400 transition-colors w-full"
        >
          <LogOut size={14} /> Se déconnecter
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-56 flex-shrink-0 flex-col bg-dasha-black fixed inset-y-0 left-0 z-40">
        <Sidebar />
      </aside>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-56 flex-shrink-0 flex flex-col bg-dasha-black">
            <div className="flex justify-end p-4">
              <button onClick={() => setSidebarOpen(false)} className="text-white">
                <X size={20} />
              </button>
            </div>
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        {/* Top bar mobile */}
        <header className="md:hidden flex items-center justify-between bg-dasha-black px-4 py-3 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-white">
            <Menu size={22} />
          </button>
          <span className="text-sm font-serif text-white tracking-wider">DASHA SHOP Admin</span>
          <div className="w-8" />
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
