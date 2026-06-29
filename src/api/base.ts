import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// sessionId del carrito: lo leemos del storage persistido por Zustand
// (clave 'shopv3-carrito') para mandarlo como header en cada request.
function getSessionId(): string | null {
  try {
    const raw = localStorage.getItem('shopv3-carrito');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.sessionId ?? null;
  } catch {
    return null;
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const sessionId = getSessionId();
  if (sessionId) config.headers['x-session-id'] = sessionId;

  return config;
});

// Si el token expiró/es inválido (401), limpiamos la sesión del cliente.
// Importación dinámica para evitar ciclo de dependencias con el store.
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error?.response?.status === 401 && localStorage.getItem('auth-token')) {
      const { useAuthStore } = await import('../store/auth');
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
