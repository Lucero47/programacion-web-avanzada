import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Producto } from '../../models/producto';
import { ProductoService } from '../../services/producto.service';
import { mensajeDeError } from '../../utils/api-error';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-heading">
      <div><div class="eyebrow">NEXOTECH · INVENTARIO TECNOLÓGICO</div><h1>Tu inventario, al día</h1><p>Equipos, periféricos y accesorios en un solo lugar.</p></div>
      <a *ngIf="auth.puedeGestionar" class="button button-primary" routerLink="/productos/nuevo"><span class="button-plus">＋</span> Nuevo artículo</a>
    </section>

    <div *ngIf="error" class="notice notice-error" role="alert">{{ error }}</div>
    <div *ngIf="loading" class="loading-card">Cargando información del inventario…</div>

    <ng-container *ngIf="!loading">
      <section class="stats-grid" aria-label="Estadísticas del inventario">
        <article class="stat-card"><div class="stat-top"><span>Artículos en catálogo</span><span class="stat-icon icon-lilac">▤</span></div><strong>{{ productos.length }}</strong><small>Productos disponibles para gestionar</small></article>
        <article class="stat-card"><div class="stat-top"><span>Categorías activas</span><span class="stat-icon icon-blue">◫</span></div><strong>{{ categorias }}</strong><small>Familias de tecnología registradas</small></article>
        <article class="stat-card"><div class="stat-top"><span>Valor del catálogo</span><span class="stat-icon icon-green">S/</span></div><strong>{{ valorCatalogo | currency:'PEN':'symbol':'1.2-2':'es-PE' }}</strong><small>Suma de los precios registrados</small></article>
      </section>

      <section class="dashboard-grid">
        <article class="panel recent-panel">
          <div class="panel-heading"><div><h2>Artículos recientes</h2><p>Últimos movimientos de tu catálogo</p></div><a class="text-link" routerLink="/productos">Ver catálogo <span>→</span></a></div>
          <div *ngIf="productos.length === 0" class="empty-state"><span class="empty-icon">▤</span><strong>Empieza tu catálogo tecnológico</strong><p>Registra equipos y accesorios para mantener toda la información organizada.</p><a *ngIf="auth.puedeGestionar" routerLink="/productos/nuevo" class="text-link">Añadir primer artículo →</a></div>
          <div *ngIf="productos.length > 0" class="recent-list">
            <div class="recent-row" *ngFor="let producto of recientes">
              <span class="product-avatar">{{ producto.nombre.charAt(0).toUpperCase() }}</span>
              <div class="recent-info"><strong>{{ producto.nombre }}</strong><small>{{ producto.categoria || 'Sin categoría' }}</small></div>
              <strong class="recent-price">{{ producto.precio | currency:'PEN':'symbol':'1.2-2':'es-PE' }}</strong>
            </div>
          </div>
        </article>

        <aside class="panel welcome-panel">
          <div class="welcome-mark">N<span>+</span></div>
          <div class="eyebrow">TECNOLOGÍA CONECTADA</div>
          <h2>Tu tecnología,<br>lista para avanzar.</h2>
          <p>Precios, categorías y detalles claros para cada equipo y accesorio.</p>
          <a routerLink="/productos" class="button button-light">Explorar catálogo <span>→</span></a>
          <div class="welcome-decoration decoration-one"></div><div class="welcome-decoration decoration-two"></div>
        </aside>
      </section>
    </ng-container>
  `
})
export class DashboardComponent implements OnInit {
  productos: Producto[] = [];
  loading = true;
  error = '';

  constructor(readonly auth: AuthService, private readonly productoService: ProductoService) {}

  get categorias(): number {
    return new Set(this.productos.map((producto) => (producto.categoria || 'Sin categoría').trim().toLocaleLowerCase())).size;
  }

  get valorCatalogo(): number {
    return this.productos.reduce((total, producto) => total + producto.precio, 0);
  }

  get recientes(): Producto[] {
    return this.productos.slice(0, 5);
  }

  ngOnInit(): void {
    this.productoService.listar().subscribe({
      next: (productos) => { this.productos = productos; this.loading = false; },
      error: (error: unknown) => { this.error = mensajeDeError(error); this.loading = false; }
    });
  }
}
