import axios, { AxiosInstance } from "axios";

const baseURL =
  import.meta.env.NEXT_PUBLIC_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export const TOKEN_KEY = "mittel_auth_token";

export const api: AxiosInstance = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ---- Endpoint helpers (frontend integration points) ----
export const AuthAPI = {
  register: (email: string, password: string) =>
    api.post("/api/auth/register", { email, password }),
  login: (email: string, password: string) =>
    api.post("/api/auth/login", { email, password }),
};

export const InquiryAPI = {
  create: (payload: { name: string; email: string; phone: string; message: string }) =>
    api.post("/api/inquiry", payload),
};

export const WorkersAPI = {
  list: () => api.get("/api/workers"),
  create: (data: any) => api.post("/api/workers", data),
  update: (id: string, data: any) => api.put(`/api/workers/${id}`, data),
  remove: (id: string) => api.delete(`/api/workers/${id}`),
};

export const AttendanceAPI = {
  mark: (payload: { date: string; entries: { workerId: string; present: boolean }[] }) =>
    api.post("/api/attendance/mark", payload),
  list: (date?: string) => api.get("/api/attendance", { params: date ? { date } : {} }),
};

export const InventoryAPI = {
  list: () => api.get("/api/inventory"),
  create: (data: any) => api.post("/api/inventory", data),
  update: (id: string, data: any) => api.put(`/api/inventory/${id}`, data),
  remove: (id: string) => api.delete(`/api/inventory/${id}`),
  logs: (itemId: string) => api.get(`/api/inventory/logs/${itemId}`),
};

export const OrdersAPI = {
  list: () => api.get("/api/orders"),
  get: (referenceId: string) => api.get(`/api/orders/${referenceId}`),
  create: (data: any) => api.post("/api/orders", data),
  updateStatus: (referenceId: string, status: string) =>
    api.put(`/api/orders/${referenceId}/status`, { status }),
};
