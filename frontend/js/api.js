const API = '/api';

const getToken = () => localStorage.getItem('token');
const getUsuario = () => JSON.parse(localStorage.getItem('usuario') || 'null');
const guardarSesion = (token, usuario) => {
  localStorage.setItem('token', token);
  localStorage.setItem('usuario', JSON.stringify(usuario));
};
const cerrarSesion = () => {
  localStorage.clear();
  location.href = 'login.html';
};

// Todas las llamadas pasan por el Gateway y llevan el JWT
async function api(ruta, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(API + ruta, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && token) cerrarSesion(); // token vencido o inválido
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
  return data;
}

const formatearPrecio = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

const esc = (t) =>
  String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function toast(mensaje, esError = false) {
  const el = document.createElement('div');
  el.className = 'toast' + (esError ? ' err' : '');
  el.textContent = mensaje;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}