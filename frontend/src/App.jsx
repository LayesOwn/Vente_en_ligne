import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Login from "./pages/admin/Login";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AddEditProduct from "./pages/admin/AddEditProduct";
import AdminOrders from "./pages/admin/AdminOrders";

function ShopLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CartDrawer />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* ─── Boutique publique ─────────────────────────────────── */}
          <Route
            path="/"
            element={
              <ShopLayout>
                <Home />
              </ShopLayout>
            }
          />
          <Route
            path="/produits"
            element={
              <ShopLayout>
                <Products />
              </ShopLayout>
            }
          />
          <Route
            path="/produits/:id"
            element={
              <ShopLayout>
                <ProductDetail />
              </ShopLayout>
            }
          />
          <Route
            path="/commande"
            element={
              <ShopLayout>
                <Checkout />
              </ShopLayout>
            }
          />
          <Route
            path="/confirmation/:orderId"
            element={
              <ShopLayout>
                <OrderConfirmation />
              </ShopLayout>
            }
          />

          {/* ─── Admin ────────────────────────────────────────────── */}
          <Route path="/admin/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="produits" element={<AdminProducts />} />
            <Route path="produits/nouveau" element={<AddEditProduct />} />
            <Route path="produits/:id/modifier" element={<AddEditProduct />} />
            <Route path="commandes" element={<AdminOrders />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
