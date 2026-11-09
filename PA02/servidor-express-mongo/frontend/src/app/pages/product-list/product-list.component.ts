import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Producto } from '../../models/producto';
import { ProductoService } from '../../services/producto.service';
import { mensajeDeError } from '../../utils/api-error';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="page-heading">
      <div><div class="eyebrow">CATÁLOGO NEXOTECH</div><h1>Equipos y accesorios</h1><p>Administra equipos, periféricos y accesorios electrónicos.</p></div>
      <a *ngIf="auth.puedeGestionar" class="button button-primary" routerLink="/productos/nuevo"><span class="button-plus">＋</span> Nuevo artículo</a>
    </section>

    <div *ngIf="notice" class="notice notice-success" role="status">{{ notice }}</div>
    <div *ngIf="error" class="notice notice-error" role="alert">{{ error }}</div>
    <div *ngIf="loading" class="loading-card">Cargando productos desde MongoDB…</div>

    <section *ngIf="!loading" class="panel catalog-panel">
      <div class="catalog-toolbar">
        <div class="toolbar-title"><h2>Todos los artículos</h2><span class="count-badge">{{ productosFiltrados.length }}</span></div>
        <div class="toolbar-filters">
          <label class="search-box"><span aria-hidden="true">⌕</span><input type="search" placeholder="Buscar producto…" [(ngModel)]="busqueda" aria-label="Buscar productos"></label>
          <select [(ngModel)]="categoriaSeleccionada" aria-label="Filtrar por categoría"><option value="">Todas las categorías</option><option *ngFor="let categoria of categorias" [value]="categoria">{{ categoria }}</option></select>
        </div>
      </div>

      <div *ngIf="productosFiltrados.length > 0" class="table-wrap">
        <table>
          <thead><tr><th>PRODUCTO</th><th>CATEGORÍA</th><th>PRECIO</th><th>ÚLTIMA ACTUALIZACIÓN</th><th><span class="sr-only">Acciones</span></th></tr></thead>
          <tbody>
            <tr *ngFor="let producto of productosFiltrados">
              <td><div class="product-cell"><span class="product-avatar">{{ producto.nombre.charAt(0).toUpperCase() }}</span><div><strong>{{ producto.nombre }}</strong><small>{{ producto.descripcion || 'Sin descripción' }}</small></div></div></td>
              <td><span class="category-pill">{{ producto.categoria || 'Sin categoría' }}</span></td>
              <td class="price-cell">{{ producto.precio | currency:'PEN':'symbol':'1.2-2':'es-PE' }}</td>
              <td class="date-cell">{{ producto.updatedAt | date:'d MMM y':'':'es-PE' }}</td>
              <td><div class="row-actions" *ngIf="auth.puedeGestionar"><a class="icon-button" [routerLink]="['/productos', producto._id, 'editar']" [attr.aria-label]="'Editar ' + producto.nombre" title="Editar">✎</a><button class="icon-button danger-action" type="button" (click)="eliminar(producto)" [attr.aria-label]="'Eliminar ' + producto.nombre" title="Eliminar">×</button></div></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="productos.length === 0" class="empty-state table-empty"><span class="empty-icon">▤</span><strong>Tu catálogo está listo para empezar</strong><p>Registra equipos y accesorios electrónicos para verlos aquí.</p><a *ngIf="auth.puedeGestionar" routerLink="/productos/nuevo" class="text-link">Añadir primer artículo →</a></div>
      <div *ngIf="productos.length > 0 && productosFiltrados.length === 0" class="empty-state table-empty"><span class="empty-icon">⌕</span><strong>No encontramos resultados</strong><p>Prueba con otro nombre o categoría.</p><button class="text-button" type="button" (click)="limpiarFiltros()">Limpiar búsqueda</button></div>
      <div class="catalog-footer" *ngIf="productos.length > 0"><span>Mostrando {{ productosFiltrados.length }} de {{ productos.length }} productos</span><span class="database-status"><i></i> Datos guardados en MongoDB</span></div>
    </section>
  `
})
export class ProductListComponent implements OnInit {
  productos: Producto[] = [];
  loading = true;
  error = '';
  notice = '';
  busqueda = '';
  categoriaSeleccionada = '';

  constructor(
    readonly auth: AuthService,
    private readonly productoService: ProductoService
  ) {
    const navigationState = window.history.state as { successMessage?: string };
    this.notice = navigationState.successMessage ?? '';
  }

  get categorias(): string[] {
    return [...new Set(this.productos.map((producto) => producto.categoria || 'Sin categoría'))].sort((a, b) => a.localeCompare(b, 'es'));
  }

  get productosFiltrados(): Producto[] {
    const consulta = this.busqueda.trim().toLocaleLowerCase();
    return this.productos.filter((producto) => {
      const coincideTexto = !consulta || [producto.nombre, producto.categoria ?? '', producto.descripcion ?? '']
        .some((valor) => valor.toLocaleLowerCase().includes(consulta));
      const coincideCategoria = !this.categoriaSeleccionada || (producto.categoria || 'Sin categoría') === this.categoriaSeleccionada;
      return coincideTexto && coincideCategoria;
    });
  }

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.loading = true;
    this.productoService.listar().subscribe({
      next: (productos) => { this.productos = productos; this.loading = false; },
      error: (error: unknown) => { this.error = mensajeDeError(error); this.loading = false; }
    });
  }

  eliminar(producto: Producto): void {
    const confirmar = window.confirm(`¿Quieres eliminar “${producto.nombre}”? Esta acción no se puede deshacer.`);
    if (!confirmar) return;

    this.productoService.eliminar(producto._id).subscribe({
      next: (respuesta) => {
        this.productos = this.productos.filter((item) => item._id !== producto._id);
        this.notice = respuesta.mensaje;
        this.error = '';
      },
      error: (error: unknown) => { this.error = mensajeDeError(error); this.notice = ''; }
    });
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.categoriaSeleccionada = '';
  }
}
