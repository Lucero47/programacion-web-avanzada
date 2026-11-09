import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import type { Producto, ProductoPayload } from '../types';
import { Rol } from '../types';

const vacio: ProductoPayload = { nombre: '', categoria: '', descripcion: '', precio: 0 };
const precio = (amount: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

export function ProductsPage() {
  const { productos, cargando, error, crear, actualizar, eliminar } = useProducts();
  const { usuario } = useAuth();
  const [params, setParams] = useSearchParams();
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('');
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);
  const [datos, setDatos] = useState<ProductoPayload>(vacio);
  const [mensaje, setMensaje] = useState('');
  const [errorFormulario, setErrorFormulario] = useState('');
  const [guardando, setGuardando] = useState(false);
  const puedeGestionar = usuario?.rol === Rol.Admin || usuario?.rol === Rol.Editor;
  const categorias = useMemo(() => [...new Set(productos.map((p) => p.categoria))].sort((a, b) => a.localeCompare(b, 'es')), [productos]);
  const filtrados = productos.filter((p) => (!busqueda || `${p.nombre} ${p.categoria} ${p.descripcion || ''}`.toLocaleLowerCase().includes(busqueda.toLocaleLowerCase())) && (!categoria || p.categoria === categoria));

  useEffect(() => { if (params.get('nuevo') === '1') { setProductoEditando(null); setDatos(vacio); setParams({}, { replace: true }); } }, [params, setParams]);

  function editar(producto: Producto) { setProductoEditando(producto); setDatos({ nombre: producto.nombre, categoria: producto.categoria, descripcion: producto.descripcion || '', precio: producto.precio }); setErrorFormulario(''); setMensaje(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setGuardando(true); setErrorFormulario(''); setMensaje('');
    try { const respuesta = productoEditando ? await actualizar(productoEditando._id, datos) : await crear(datos); setMensaje(respuesta); setDatos(vacio); setProductoEditando(null); }
    catch (err) { setErrorFormulario(err instanceof Error ? err.message : 'No se pudo guardar el artículo.'); }
    finally { setGuardando(false); }
  }
  async function borrar(producto: Producto) {
    if (!window.confirm(`¿Eliminar ${producto.nombre}? Esta acción no se puede deshacer.`)) return;
    setMensaje(''); setErrorFormulario('');
    try { setMensaje(await eliminar(producto._id)); }
    catch (err) { setErrorFormulario(err instanceof Error ? err.message : 'No se pudo eliminar el artículo.'); }
  }

  return <>
    <section className="page-heading"><div><div className="eyebrow">CATÁLOGO NEXOTECH</div><h1>Equipos y accesorios</h1><p>Administra equipos, periféricos y accesorios electrónicos.</p></div>{puedeGestionar && <button className="button button-primary" onClick={() => { setProductoEditando(null); setDatos(vacio); document.getElementById('product-form')?.scrollIntoView({ behavior: 'smooth' }); }}>＋ Nuevo artículo</button>}</section>
    {error && <div className="alert alert-error">{error}</div>}{mensaje && <div className="alert alert-success">{mensaje}</div>}{errorFormulario && <div className="alert alert-error">{errorFormulario}</div>}
    {puedeGestionar && <section id="product-form" className="panel editor-panel"><div className="panel-heading"><div><h2>{productoEditando ? 'Editar artículo' : 'Registrar artículo'}</h2><p>Completa los datos del producto electrónico.</p></div>{productoEditando && <button className="text-button" onClick={() => { setProductoEditando(null); setDatos(vacio); }}>Cancelar edición</button>}</div>
      <form className="product-form" onSubmit={guardar}><label>Nombre<input required minLength={2} maxLength={100} value={datos.nombre} onChange={(e) => setDatos({ ...datos, nombre: e.target.value })} placeholder="Ej. Teclado mecánico" /></label><label>Categoría<input required minLength={2} maxLength={60} value={datos.categoria} onChange={(e) => setDatos({ ...datos, categoria: e.target.value })} placeholder="Ej. Periféricos" /></label><label>Precio (S/)<input required type="number" min="0" step="0.01" value={datos.precio} onChange={(e) => setDatos({ ...datos, precio: Number(e.target.value) })} /></label><label className="field-wide">Descripción<textarea maxLength={500} rows={3} value={datos.descripcion} onChange={(e) => setDatos({ ...datos, descripcion: e.target.value })} placeholder="Marca, modelo y características principales" /></label><div className="form-actions"><button className="button button-primary" disabled={guardando}>{guardando ? 'Guardando…' : productoEditando ? 'Guardar cambios' : 'Registrar artículo'}</button></div></form>
    </section>}
    <section className="panel catalog-panel"><div className="catalog-toolbar"><div className="toolbar-title"><h2>Todos los artículos</h2><span className="count-badge">{filtrados.length}</span></div><div className="toolbar-filters"><label className="search-box"><span>⌕</span><input type="search" placeholder="Buscar producto…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} /></label><select aria-label="Filtrar por categoría" value={categoria} onChange={(e) => setCategoria(e.target.value)}><option value="">Todas las categorías</option>{categorias.map((item) => <option key={item}>{item}</option>)}</select></div></div>
      {cargando ? <div className="loading-card">Cargando productos…</div> : filtrados.length ? <div className="table-wrap"><table><thead><tr><th>PRODUCTO</th><th>CATEGORÍA</th><th>PRECIO</th><th>ACTUALIZACIÓN</th><th>ACCIONES</th></tr></thead><tbody>{filtrados.map((p) => <tr key={p._id}><td><div className="product-cell"><span className="product-avatar">{p.nombre.charAt(0).toUpperCase()}</span><div><strong>{p.nombre}</strong><small>{p.descripcion || 'Sin descripción'}</small></div></div></td><td><span className="category-pill">{p.categoria}</span></td><td className="price-cell">{precio(p.precio)}</td><td className="date-cell">{p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('es-PE') : '—'}</td><td>{puedeGestionar && <div className="row-actions"><button className="icon-button" onClick={() => editar(p)} aria-label={`Editar ${p.nombre}`}>✎</button><button className="icon-button danger-action" onClick={() => borrar(p)} aria-label={`Eliminar ${p.nombre}`}>×</button></div>}</td></tr>)}</tbody></table></div> : <div className="empty-state table-empty"><strong>{productos.length ? 'No encontramos resultados' : 'Tu catálogo está listo para empezar'}</strong><p>{productos.length ? 'Prueba otro nombre o categoría.' : 'Registra equipos y accesorios electrónicos para verlos aquí.'}</p></div>}
      {!cargando && productos.length > 0 && <div className="catalog-footer"><span>Mostrando {filtrados.length} de {productos.length} productos</span><span className="database-status"><i /> Datos guardados en MongoDB</span></div>}
    </section>
  </>;
}
