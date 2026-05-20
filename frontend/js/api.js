// Cliente fetch del frontend.
// Cambia API_URL si tu backend corre en otra IP/puerto.
const API_URL = 'http://localhost:3000/api';

function getToken() { return localStorage.getItem('ecomonitor_token'); }
function getUser()  { try { return JSON.parse(localStorage.getItem('ecomonitor_user') || 'null'); } catch { return null; } }
function setSession(token, user) {
  localStorage.setItem('ecomonitor_token', token);
  localStorage.setItem('ecomonitor_user', JSON.stringify(user));
}
function clearSession() {
  localStorage.removeItem('ecomonitor_token');
  localStorage.removeItem('ecomonitor_user');
}

async function api(path, options = {}) {
  const headers = options.headers || {};
  headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(API_URL + path, { ...options, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.message || `HTTP ${res.status}`);
    err.code = body.code; err.status = res.status;
    throw err;
  }
  return body;
}

// Redirige al login si no hay token
function requireAuth() {
  if (!getToken()) {
    window.location.href = 'index.html';
  }
}
