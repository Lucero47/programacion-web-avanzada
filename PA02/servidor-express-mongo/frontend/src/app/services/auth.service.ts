import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, finalize, map, of, shareReplay, tap } from 'rxjs';
import { RespuestaAuth, RolUsuario, Usuario } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'nexotech.token';
  private readonly usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  private sessionRequest?: Observable<Usuario | null>;
  readonly usuario$ = this.usuarioSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  get usuarioActual(): Usuario | null { return this.usuarioSubject.value; }
  get token(): string | null { return localStorage.getItem(this.tokenKey); }
  get puedeGestionar(): boolean {
    const rol = this.usuarioActual?.rol;
    return rol === RolUsuario.Admin || rol === RolUsuario.Editor;
  }

  asegurarSesion(): Observable<Usuario | null> {
    if (this.usuarioActual) return of(this.usuarioActual);
    const token = this.token;
    if (!token) return of(null);
    if (this.sessionRequest) return this.sessionRequest;
    this.sessionRequest = this.http.get<{ usuario: Usuario }>('/api/auth/me').pipe(
      map((respuesta) => respuesta.usuario),
      tap((usuario) => this.usuarioSubject.next(usuario)),
      catchError(() => { this.limpiarSesionLocal(); return of(null); }),
      finalize(() => { this.sessionRequest = undefined; }),
      shareReplay(1)
    );
    return this.sessionRequest;
  }

  iniciarSesion(datos: { email: string; password: string }): Observable<RespuestaAuth> {
    return this.http.post<RespuestaAuth>('/api/auth/login', datos).pipe(tap((respuesta) => this.establecerSesion(respuesta)));
  }

  registrar(datos: { nombre: string; email: string; password: string }): Observable<RespuestaAuth> {
    return this.http.post<RespuestaAuth>('/api/auth/registro', datos).pipe(tap((respuesta) => this.establecerSesion(respuesta)));
  }

  cerrarSesion(): Observable<unknown> {
    if (!this.token) { this.limpiarSesionLocal(); return of(null); }
    return this.http.post('/api/auth/logout', {}).pipe(
      catchError(() => of(null)),
      finalize(() => this.limpiarSesionLocal())
    );
  }

  listarUsuarios(): Observable<Usuario[]> { return this.http.get<Usuario[]>('/api/auth/usuarios'); }
  actualizarRol(id: string, rol: RolUsuario): Observable<{ mensaje: string; usuario: Usuario }> {
    return this.http.patch<{ mensaje: string; usuario: Usuario }>(`/api/auth/usuarios/${id}/rol`, { rol });
  }

  limpiarSesionLocal(): void {
    localStorage.removeItem(this.tokenKey);
    this.usuarioSubject.next(null);
    this.sessionRequest = undefined;
  }

  private establecerSesion(respuesta: RespuestaAuth): void {
    localStorage.setItem(this.tokenKey, respuesta.token);
    this.usuarioSubject.next(respuesta.usuario);
    this.sessionRequest = undefined;
  }
}
