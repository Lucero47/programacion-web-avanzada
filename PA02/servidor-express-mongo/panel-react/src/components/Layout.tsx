import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Rol } from '../types';

export function Layout() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  async function salir() { await cerrarSesion(); navigate('/login', { replace: true }); }
  const rol = usuario?.rol === Rol.Admin ? 'Administrador' : usuario?.rol === Rol.Editor ? 'Editor' : 'Lector';
  return <div className="app-shell">
    <aside className="sidebar">
      <NavLink className="brand" to="/"><span className="brand-mark">N<span>+</span></span><span><strong>nexotech</strong><small>CATÁLOGO ELECTRÓNICO</small></span></NavLink>
      <div className="nav-label">MENÚ PRINCIPAL</div>
      <nav className="main-nav"><NavLink to="/" end><span>◫</span> Panel general</NavLink><NavLink to="/productos"><span>▧</span> Catálogo</NavLink>{usuario?.rol === Rol.Admin && <NavLink to="/usuarios"><span>♙</span> Usuarios</NavLink>}</nav>
      <div className="sidebar-bottom"><div className="workspace-card"><i /> <div><strong>Catálogo en línea</strong><small>Sincronizado con MongoDB</small></div></div>
        <div className="user-card"><span className="avatar">{usuario?.nombre.slice(0, 1).toUpperCase()}</span><div className="user-copy"><strong>{usuario?.nombre}</strong><small>{rol}</small></div><button className="logout-button" onClick={salir}>Salir</button></div>
      </div>
    </aside>
    <main className="main-panel"><header className="topbar"><div><span>NexoTech</span><b>/</b><strong>Panel tecnológico</strong></div><span className="top-avatar">{usuario?.nombre.slice(0, 1).toUpperCase()}</span></header><div className="page-content"><Outlet /></div><footer className="footer">NexoTech <span>·</span> Tecnología en orden, negocio en marcha</footer></main>
  </div>;
}
