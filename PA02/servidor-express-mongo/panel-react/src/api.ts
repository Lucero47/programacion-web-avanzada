import axios from 'axios';

export const TOKEN_KEY = 'nexotech.token';
export const sessionExpiredEvent = 'nexotech:session-expired';

export const api = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use((response) => response, (error: unknown) => {
  const path = axios.isAxiosError(error) ? error.config?.url || '' : '';
  const rutaPublica = path.endsWith('/auth/login') || path.endsWith('/auth/registro');
  if (axios.isAxiosError(error) && error.response?.status === 401 && !rutaPublica) {
    localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new CustomEvent(sessionExpiredEvent));
  }
  return Promise.reject(error);
});

export function mensajeError(error: unknown): string {
  if (axios.isAxiosError<{ mensaje?: string }>(error)) return error.response?.data?.mensaje || 'No se pudo completar la solicitud.';
  return 'Ocurrió un error inesperado.';
}
