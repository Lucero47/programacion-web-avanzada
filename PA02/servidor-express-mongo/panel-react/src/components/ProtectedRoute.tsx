import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Rol } from '../types';

export function ProtectedRoute({ roles }: { roles?: Rol[] }) {
  const { usuario, cargando } = useAuth();
  const location = useLocation();
  if (cargando) return <div className="screen-loading">Verificando sesión…</div>;
  if (!usuario) return <Navigate to="/login" replace state={{ from: location, expired: true }} />;
  if (roles && !roles.includes(usuario.rol)) return <Navigate to="/" replace />;
  return <Outlet />;
}
