import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_token");
      if (window.location.pathname.startsWith("/admin")) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

// ─── Products ──────────────────────────────────────────────────────────────────
export const getProducts = (params = {}) => api.get("/products", { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const getCategories = () => api.get("/products/categories");
export const createProduct = (data) => api.post("/products", data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// ─── Orders ────────────────────────────────────────────────────────────────────
export const createOrder = (data) => api.post("/orders", data);
export const getOrders = () => api.get("/orders");
// Suivi public par jeton non devinable (page de confirmation client)
export const trackOrder = (token) => api.get(`/orders/track/${token}`);
export const updateOrderStatus = (id, status) =>
  api.put(`/orders/${id}/status`, { status });
export const getInvoiceUrl = (token) => `/api/orders/track/${token}/invoice`;

// ─── Admin ─────────────────────────────────────────────────────────────────────
export const getStats = () => api.get("/admin/stats");
export const getProfile = () => api.get("/admin/profile");
export const updateProfile = (data) => api.put("/admin/profile", data);
export const uploadImage = (file) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/admin/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export default api;
