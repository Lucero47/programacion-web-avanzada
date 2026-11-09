import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, sessionExpiredEvent, TOKEN_KEY } from '../api';
import type { AuthResponse, Usuario } from '../types';

interface AuthContextValue {
  usuario: Usuario | null;
  cargando: boolean;
  iniciarSesion: (email: string, password: string) => Promise<void>;
  registrar: (nombre: string, email: string, password: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  limpiarSesion: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function expiracionToken(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  const limpiarSesion = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUsuario(null);
    setCargando(false);
  }, []);

  const guardarSesion = useCallback((respuesta: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, respuesta.token);
    setToken(respuesta.token);
    setUsuario(respuesta.usuario);
    setCargando(false);
  }, []);

  useEffect(() => {
    const manejarExpiracion = () => limpiarSesion();
    window.addEventListener(sessionExpiredEvent, manejarExpiracion);
    return () => window.removeEventListener(sessionExpiredEvent, manejarExpiracion);
  }, [limpiarSesion]);

  useEffect(() => {
    let activo = true;
    if (!token) { setCargando(false); return () => { activo = false; }; }
    setCargando(true);
    api.get<{ usuario: Usuario }>('/auth/me').then(({ data }) => {
      if (activo) { setUsuario(data.usuario); setCargando(false); }
    }).catch(() => {
      if (activo) limpiarSesion();
    });
    return () => { activo = false; };
  }, [token, limpiarSesion]);

  useEffect(() => {
    if (!token) return;
    const expira = expiracionToken(token);
    if (!expira) return;
    const tiempo = expira - Date.now();
    if (tiempo <= 0) { limpiarSesion(); return; }
    const timer = window.setTimeout(() => window.dispatchEvent(new CustomEvent(sessionExpiredEvent)), Math.min(tiempo, 2_147_000_000));
    return () => window.clearTimeout(timer);
  }, [token, limpiarSesion]);

  const iniciarSesion = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    guardarSesion(data);
  }, [guardarSesion]);

  const registrar = useCallback(async (nombre: string, email: string, password: string) => {
    const { data } = await api.post<AuthResponse>('/auth/registro', { nombre, email, password });
    guardarSesion(data);
  }, [guardarSesion]);

  const cerrarSesion = useCallback(async () => {
    try { if (localStorage.getItem(TOKEN_KEY)) await api.post('/auth/logout'); }
    catch { /* La sesión local se elimina aunque el servidor ya no acepte el token. */ }
    finally { limpiarSesion(); }
  }, [limpiarSesion]);

  const value = useMemo(() => ({ usuario, cargando, iniciarSesion, registrar, cerrarSesion, limpiarSesion }), [usuario, cargando, iniciarSesion, registrar, cerrarSesion, limpiarSesion]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}
