const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:10000').replace(/\/$/, '');

export function getToken() {
  return localStorage.getItem('kinosmotr_token');
}

export function saveSession(data) {
  localStorage.setItem('kinosmotr_token', data.token);
  localStorage.setItem('kinosmotr_user', JSON.stringify(data.user));
}

export function clearSession() {
  localStorage.removeItem('kinosmotr_token');
  localStorage.removeItem('kinosmotr_user');
}

export function getUser() {
  try { return JSON.parse(localStorage.getItem('kinosmotr_user') || 'null'); } catch { return null; }
}

export async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Ошибка запроса');
  return data;
}
