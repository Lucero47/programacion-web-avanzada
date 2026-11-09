import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { RolUsuario } from './models/usuario';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <ng-container *ngIf="auth.usuario$ | async as usuario; else publicShell">
      <div class="app-shell">
        <aside class="sidebar">
          <a class="brand" routerLink="/" aria-label="NexoTech, inicio">
            <span class="brand-mark">N<span>+</span></span>
            <span class="brand-copy"><strong>nexotech</strong><small>CATÁLOGO ELECTRÓNICO</small></span>
          </a>
          <div class="nav-label">MENÚ PRINCIPAL</div>
          <nav class="main-nav" aria-label="Navegación principal">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }"><span class="nav-icon">◫</span> Panel general</a>
            <a routerLink="/productos" routerLinkActive="active"><span class="nav-icon">▧</span> Catálogo</a>
            <a *ngIf="usuario.rol === RolUsuario.Admin" routerLink="/usuarios" routerLinkActive="active"><span class="nav-icon">♙</span> Usuarios</a>
          </nav>
          <div class="sidebar-bottom">
            <div class="workspace-card"><span class="workspace-dot"></span><div><strong>Catálogo en línea</strong><small>Sincronizado con MongoDB</small></div></div>
            <div class="user-card"><span class="avatar">{{ usuario.nombre.charAt(0).toUpperCase() }}</span><div><strong>{{ usuario.nombre }}</strong><small>{{ nombreRol(usuario.rol) }}</small></div><button class="logout-button" type="button" (click)="cerrarSesion()">Salir</button></div>
          </div>
        </aside>
        <main class="main-panel">
          <header class="topbar"><div class="breadcrumb"><span>NexoTech</span><span class="breadcrumb-slash">/</span><strong>Panel tecnológico</strong></div><div class="topbar-right"><span class="today">{{ today }}</span><span class="top-avatar">{{ usuario.nombre.charAt(0).toUpperCase() }}</span></div></header>
          <div class="page-content"><router-outlet /></div>
          <footer class="footer">NexoTech <span>·</span> Tecnología en orden, negocio en marcha</footer>
        </main>
      </div>
    </ng-container>
    <ng-template #publicShell><router-outlet /></ng-template>
  `
})
export class AppComponent {
  readonly today = new Intl.DateTimeFormat('es-PE', { dateStyle: 'long' }).format(new Date());
  readonly RolUsuario = RolUsuario;
  constructor(readonly auth: AuthService, private readonly router: Router) {}
  nombreRol(rol: string): string {
    return ({ [RolUsuario.Admin]: 'Administrador', [RolUsuario.Editor]: 'Editor', [RolUsuario.Viewer]: 'Lector' } as Record<string, string>)[rol] || rol;
  }
  cerrarSesion(): void {
    this.auth.cerrarSesion().subscribe(() => { void this.router.navigate(['/login']); });
  }
}
