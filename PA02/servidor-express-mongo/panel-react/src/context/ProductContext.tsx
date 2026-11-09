import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, mensajeError } from '../api';
import { useAuth } from './AuthContext';
import type { Producto, ProductoPayload } from '../types';

interface ProductContextValue {
  productos: Producto[];
  cargando: boolean;
  error: string;
  recargar: () => Promise<void>;
  crear: (datos: ProductoPayload) => Promise<string>;
  actualizar: (id: string, datos: ProductoPayload) => Promise<string>;
  eliminar: (id: string) => Promise<string>;
}
const ProductContext = createContext<ProductContextValue | null>(null);

export function ProductProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const recargar = useCallback(async () => {
    if (!usuario) { setProductos([]); return; }
    setCargando(true); setError('');
    try { const { data } = await api.get<Producto[]>('/productos'); setProductos(data); }
    catch (err) { setError(mensajeError(err)); }
    finally { setCargando(false); }
  }, [usuario]);

  useEffect(() => { void recargar(); }, [recargar]);

  const crear = useCallback(async (datos: ProductoPayload) => {
    try { const { data } = await api.post<{ mensaje: string; producto: Producto }>('/productos', datos); setProductos((items) => [data.producto, ...items]); return data.mensaje; }
    catch (err) { throw new Error(mensajeError(err)); }
  }, []);

  const actualizar = useCallback(async (id: string, datos: ProductoPayload) => {
    try { const { data } = await api.put<{ mensaje: string; producto: Producto }>(`/productos/${id}`, datos); setProductos((items) => items.map((item) => item._id === id ? data.producto : item)); return data.mensaje; }
    catch (err) { throw new Error(mensajeError(err)); }
  }, []);

  const eliminar = useCallback(async (id: string) => {
    try { const { data } = await api.delete<{ mensaje: string }>(`/productos/${id}`); setProductos((items) => items.filter((item) => item._id !== id)); return data.mensaje; }
    catch (err) { throw new Error(mensajeError(err)); }
  }, []);

  const value = useMemo(() => ({ productos, cargando, error, recargar, crear, actualizar, eliminar }), [productos, cargando, error, recargar, crear, actualizar, eliminar]);
  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProducts(): ProductContextValue {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts debe usarse dentro de ProductProvider');
  return context;
}
