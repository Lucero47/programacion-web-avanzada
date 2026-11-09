import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { mensajeError } from '../api';
import { useAuth } from '../context/AuthContext';

export function AuthPage({ registro = false }: { registro?: boolean }) {
  const { iniciarSesion, registrar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const expirada = new URLSearchParams(location.search).has('expired') || Boolean((location.state as { expired?: boolean } | null)?.expired);

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setEnviando(true);
    try {
      if (registro) await registrar(nombre, email, password);
      else await iniciarSesion(email, password);
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) { setError(mensajeError(err)); }
    finally { setEnviando(false); }
  }

  return <main className="auth-screen"><section className="auth-card">
    <Link className="brand" to="/login"><span className="brand-mark">N<span>+</span></span><span><strong>nexotech</strong><small>CATÁLOGO ELECTRÓNICO</small></span></Link>
    <div className="eyebrow">ACCESO SEGURO</div><h1>{registro ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}</h1>
    <p className="auth-copy">{registro ? 'Regístrate para consultar el catálogo electrónico.' : 'Inicia sesión para administrar el catálogo NexoTech.'}</p>
    {expirada && <p className="alert alert-error">Tu sesión expiró. Inicia sesión nuevamente.</p>}
    {error && <p className="alert alert-error" role="alert">{error}</p>}
    <form className="form-stack" onSubmit={enviar}>
      {registro && <label>Nombre completo<input required minLength={2} maxLength={80} autoComplete="name" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" /></label>}
      <label>Correo electrónico<input type="email" required maxLength={254} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nombre@correo.com" /></label>
      <label>Contraseña<input type="password" required minLength={8} maxLength={72} autoComplete={registro ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8 a 72 caracteres" /></label>
      <button className="button button-primary full-width" disabled={enviando}>{enviando ? 'Procesando…' : registro ? 'Crear cuenta' : 'Iniciar sesión'}</button>
    </form>
    <p className="auth-switch">{registro ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?'} <Link to={registro ? '/login' : '/registro'}>{registro ? 'Inicia sesión' : 'Regístrate'}</Link></p>
    <small className="role-note">Registra primero el correo configurado en ADMIN_EMAIL. Si no se configuró, la primera cuenta será administradora.</small>
  </section></main>;
}
