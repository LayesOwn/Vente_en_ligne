import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

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
export const getOrder = (id) => api.get(`/orders/${id}`);
export const updateOrderStatus = (id, status) =>
  api.put(`/orders/${id}/status`, { status });
export const getInvoiceUrl = (id) => `/api/orders/${id}/invoice`;

// ─── Admin ─────────────────────────────────────────────────────────────────────
export const getStats = () => api.get("/admin/stats");
export const uploadImage = (file) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/admin/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export default api;
