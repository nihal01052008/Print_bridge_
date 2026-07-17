import api from "./api.js";

const TOKEN_KEY = "pb_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function login(email, password) {
  const res = await api.post("/auth/login", { email, password });
  setToken(res.data.token);
  return res.data.user;
}

export async function fetchCurrentUser() {
  const res = await api.get("/auth/me");
  return res.data.user;
}

export function logout() {
  clearToken();
}
