import { useEffect, useState } from 'react';
import { api, mensajeError } from '../api';
import type { Rol, Usuario } from '../types';

export function UsersPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  useEffect(() => { api.get<Usuario[]>('/auth/usuarios').then(({ data }) => setUsuarios(data)).catch((err: unknown) => setError(mensajeError(err))); }, []);
  async function cambiarRol(usuario: Usuario, rol: Rol) {
    if (usuario.rol === rol) return;
    setError(''); setMensaje('');
    try { const { data } = await api.patch<{ mensaje: string; usuario: Usuario }>(`/auth/usuarios/${usuario.id}/rol`, { rol }); setUsuarios((items) => items.map((item) => item.id === usuario.id ? data.usuario : item)); setMensaje(data.mensaje); }
    catch (err) { setError(mensajeError(err)); }
  }
  return <><section className="page-heading"><div><div className="eyebrow">ADMINISTRACIÓN</div><h1>Usuarios y permisos</h1><p>Asigna el nivel de acceso de cada cuenta.</p></div></section>{error && <div className="alert alert-error">{error}</div>}{mensaje && <div className="alert alert-success">{mensaje}</div>}<section className="panel users-panel"><div className="table-wrap"><table><thead><tr><th>USUARIO</th><th>REGISTRO</th><th>ROL</th></tr></thead><tbody>{usuarios.map((u) => <tr key={u.id}><td><div className="product-cell"><span className="product-avatar">{u.nombre.charAt(0).toUpperCase()}</span><div><strong>{u.nombre}</strong><small>{u.email}</small></div></div></td><td className="date-cell">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-PE') : '—'}</td><td><select value={u.rol} onChange={(e) => void cambiarRol(u, e.target.value as Rol)}><option value="admin">Administrador</option><option value="editor">Editor</option><option value="viewer">Lector</option></select></td></tr>)}</tbody></table>{!usuarios.length && <p className="empty-state">No hay cuentas registradas.</p>}</div></section></>;
}
