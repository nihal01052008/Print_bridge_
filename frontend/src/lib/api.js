import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "" : "https://print-bridge-cfoo.onrender.com");

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pb_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("pb_token");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("pb:unauthorized"));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
