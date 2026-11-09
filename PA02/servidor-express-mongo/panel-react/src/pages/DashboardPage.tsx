import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { Rol } from '../types';

const precio = (amount: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

export function DashboardPage() {
  const { productos, cargando, error } = useProducts();
  const { usuario } = useAuth();
  const categorias = new Set(productos.map((p) => p.categoria.toLocaleLowerCase())).size;
  const valor = productos.reduce((total, p) => total + p.precio, 0);
  const puedeGestionar = usuario?.rol === Rol.Admin || usuario?.rol === Rol.Editor;
  return <>
    <section className="page-heading"><div><div className="eyebrow">NEXOTECH · INVENTARIO TECNOLÓGICO</div><h1>Tu inventario, al día</h1><p>Equipos, periféricos y accesorios en un solo lugar.</p></div>{puedeGestionar && <Link className="button button-primary" to="/productos?nuevo=1">＋ Nuevo artículo</Link>}</section>
    {error && <div className="alert alert-error">{error}</div>}
    {cargando ? <div className="loading-card">Cargando productos…</div> : <>
      <section className="stats-grid"><article className="stat-card"><small>Artículos en catálogo</small><strong>{productos.length}</strong><span>Productos registrados</span></article><article className="stat-card"><small>Categorías activas</small><strong>{categorias}</strong><span>Familias de tecnología</span></article><article className="stat-card"><small>Valor del catálogo</small><strong>{precio(valor)}</strong><span>Suma de precios registrados</span></article></section>
      <section className="dashboard-grid"><article className="panel recent-panel"><div className="panel-heading"><div><h2>Artículos recientes</h2><p>Últimos productos de tu catálogo</p></div><Link className="text-link" to="/productos">Ver catálogo →</Link></div>
        {productos.length ? <div className="recent-list">{productos.slice(0, 5).map((p) => <div className="recent-row" key={p._id}><span className="product-avatar">{p.nombre.charAt(0).toUpperCase()}</span><div className="recent-info"><strong>{p.nombre}</strong><small>{p.categoria}</small></div><b>{precio(p.precio)}</b></div>)}</div> : <div className="empty-state"><strong>El catálogo está listo</strong><p>Registra equipos y accesorios para empezar.</p><Link to="/productos">Abrir catálogo</Link></div>}
      </article><aside className="welcome-panel"><div className="welcome-mark">N<span>+</span></div><div className="eyebrow">TECNOLOGÍA CONECTADA</div><h2>Tu tecnología,<br />lista para avanzar.</h2><p>Precios, categorías y detalles claros para cada equipo.</p><Link className="button button-light" to="/productos">Explorar catálogo →</Link></aside></section>
    </>}
  </>;
}
