import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductoPayload } from '../../models/producto';
import { ProductoService } from '../../services/producto.service';
import { mensajeDeError } from '../../utils/api-error';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page-heading form-heading">
      <div><a routerLink="/productos" class="back-link">← Volver al catálogo</a><div class="eyebrow">{{ editando ? 'ACTUALIZA EL CATÁLOGO' : 'AMPLÍA TU CATÁLOGO' }}</div><h1>{{ editando ? 'Editar artículo' : 'Nuevo artículo' }}</h1><p>{{ editando ? 'Modifica la información del artículo.' : 'Completa los datos para registrar un nuevo artículo.' }}</p></div>
    </section>

    <div *ngIf="error" class="notice notice-error" role="alert">{{ error }}</div>
    <div *ngIf="loading" class="loading-card">Cargando información del producto…</div>

    <form *ngIf="!loading" [formGroup]="form" (ngSubmit)="guardar()" novalidate class="form-layout">
      <section class="panel form-panel">
        <div class="form-section-heading"><span class="form-section-icon">▤</span><div><h2>Información general</h2><p>Los campos con * son obligatorios.</p></div></div>

        <div class="field-grid">
          <label class="field field-wide" for="nombre"><span>Nombre del artículo <b>*</b></span><input id="nombre" type="text" formControlName="nombre" placeholder="Ej. Teclado mecánico Kairo 75" maxlength="100" autocomplete="off"><small *ngIf="mostrarError('nombre')" class="field-error">{{ errorCampo('nombre') }}</small></label>
          <label class="field" for="categoria"><span>Categoría <b>*</b></span><input id="categoria" type="text" formControlName="categoria" placeholder="Ej. Periféricos" maxlength="60" autocomplete="off"><small *ngIf="mostrarError('categoria')" class="field-error">{{ errorCampo('categoria') }}</small></label>
          <label class="field" for="precio"><span>Precio (S/) <b>*</b></span><div class="input-prefix"><span>S/</span><input id="precio" type="number" formControlName="precio" placeholder="0.00" min="0" step="0.01"></div><small *ngIf="mostrarError('precio')" class="field-error">{{ errorCampo('precio') }}</small></label>
          <label class="field field-wide" for="descripcion"><span>Descripción <small class="optional-label">Opcional</small></span><textarea id="descripcion" formControlName="descripcion" rows="4" maxlength="500" placeholder="Ej. Conexión Bluetooth, batería de 40 horas y estuche incluido."></textarea><small class="field-hint">{{ form.controls.descripcion.value.length }}/500 caracteres</small><small *ngIf="mostrarError('descripcion')" class="field-error">{{ errorCampo('descripcion') }}</small></label>
        </div>

        <div class="form-actions"><a routerLink="/productos" class="button button-secondary">Cancelar</a><button class="button button-primary" type="submit" [disabled]="guardando"><span *ngIf="guardando" class="button-spinner"></span>{{ guardando ? 'Guardando…' : (editando ? 'Guardar cambios' : 'Registrar artículo') }}</button></div>
      </section>

      <aside class="form-aside"><div class="form-aside-icon">✦</div><strong>Tu catálogo, siempre al día</strong><p>Los cambios se guardan en MongoDB y se reflejan en el catálogo al instante.</p><div class="aside-divider"></div><small>Consejo NexoTech</small><p>Incluye marca, modelo y compatibilidad para identificar cada equipo con facilidad.</p></aside>
    </form>
  `
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    categoria: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
    descripcion: ['', [Validators.maxLength(500)]],
    precio: [0, [Validators.required, Validators.min(0)]]
  });

  productoId: string | null = null;
  loading = false;
  guardando = false;
  error = '';
  submitted = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly productoService: ProductoService
  ) {}

  get editando(): boolean { return this.productoId !== null; }

  ngOnInit(): void {
    this.productoId = this.route.snapshot.paramMap.get('id');
    if (!this.productoId) return;

    this.loading = true;
    this.productoService.obtener(this.productoId).subscribe({
      next: (producto) => {
        this.form.patchValue({
          nombre: producto.nombre,
          categoria: producto.categoria ?? '',
          descripcion: producto.descripcion ?? '',
          precio: producto.precio
        });
        this.loading = false;
      },
      error: (error: unknown) => { this.error = mensajeDeError(error); this.loading = false; }
    });
  }

  mostrarError(campo: 'nombre' | 'categoria' | 'precio' | 'descripcion'): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.touched || this.submitted);
  }

  errorCampo(campo: 'nombre' | 'categoria' | 'precio' | 'descripcion'): string {
    const control = this.form.controls[campo];
    if (control.hasError('required')) return 'Este campo es obligatorio.';
    if (control.hasError('minlength')) return 'Escribe al menos 2 caracteres.';
    if (control.hasError('maxlength')) return campo === 'descripcion' ? 'La descripción supera los 500 caracteres.' : 'El texto supera el máximo permitido.';
    if (control.hasError('min')) return 'El precio debe ser cero o mayor.';
    return 'Revisa el valor ingresado.';
  }

  guardar(): void {
    this.submitted = true;
    if (this.form.invalid || this.guardando) {
      this.form.markAllAsTouched();
      return;
    }

    const datos: ProductoPayload = this.form.getRawValue();
    this.guardando = true;
    this.error = '';
    const solicitud = this.productoId
      ? this.productoService.actualizar(this.productoId, datos)
      : this.productoService.crear(datos);

    solicitud.subscribe({
      next: (respuesta) => {
        const successMessage = respuesta.mensaje;
        this.router.navigate(['/productos'], { state: { successMessage } });
      },
      error: (error: unknown) => { this.error = mensajeDeError(error); this.guardando = false; }
    });
  }
}
