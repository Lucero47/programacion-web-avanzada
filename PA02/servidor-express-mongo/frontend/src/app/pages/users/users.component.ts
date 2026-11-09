import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RolUsuario, Usuario } from '../../models/usuario';
import { mensajeDeError } from '../../utils/api-error';

@Component({
  selector: 'app-users', standalone: true, imports: [CommonModule, FormsModule],
  template: `
    <section class="page-heading"><div><div class="eyebrow">ADMINISTRACIÓN</div><h1>Usuarios y permisos</h1><p>Asigna el nivel de acceso para cada cuenta.</p></div></section>
    <div *ngIf="error" class="notice notice-error" role="alert">{{ error }}</div>
    <div *ngIf="mensaje" class="notice notice-success" role="status">{{ mensaje }}</div>
    <div *ngIf="loading" class="loading-card">Cargando usuarios…</div>
    <section *ngIf="!loading" class="panel users-panel"><div class="users-table-wrap"><table><thead><tr><th>USUARIO</th><th>FECHA DE REGISTRO</th><th>ROL</th></tr></thead><tbody><tr *ngFor="let usuario of usuarios"><td><div class="product-cell"><span class="product-avatar">{{ usuario.nombre.charAt(0).toUpperCase() }}</span><div><strong>{{ usuario.nombre }}</strong><small>{{ usuario.email }}</small></div></div></td><td class="date-cell">{{ usuario.createdAt | date:'d MMM y':'':'es-PE' }}</td><td><select aria-label="Rol del usuario" [ngModel]="usuario.rol" (ngModelChange)="cambiarRol(usuario, $event)"><option value="admin">Administrador</option><option value="editor">Editor</option><option value="viewer">Lector</option></select></td></tr></tbody></table></div><div *ngIf="usuarios.length === 0" class="empty-state">No hay usuarios registrados.</div></section>
  `
})
export class UsersComponent implements OnInit {
  usuarios: Usuario[] = [];
  loading = true;
  error = '';
  mensaje = '';
  constructor(private readonly auth: AuthService) {}
  ngOnInit(): void { this.cargar(); }
  cargar(): void {
    this.auth.listarUsuarios().subscribe({ next: (items) => { this.usuarios = items; this.loading = false; }, error: (error: unknown) => { this.error = mensajeDeError(error); this.loading = false; } });
  }
  cambiarRol(usuario: Usuario, rol: RolUsuario): void {
    if (usuario.rol === rol) return;
    this.error = ''; this.mensaje = '';
    this.auth.actualizarRol(usuario.id, rol).subscribe({
      next: (respuesta) => { usuario.rol = respuesta.usuario.rol; this.mensaje = respuesta.mensaje; },
      error: (error: unknown) => { this.error = mensajeDeError(error); this.cargar(); }
    });
  }
}
