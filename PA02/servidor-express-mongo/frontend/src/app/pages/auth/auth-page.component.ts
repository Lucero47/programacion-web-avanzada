import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { mensajeDeError } from '../../utils/api-error';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <main class="auth-page"><section class="auth-card">
      <a class="brand auth-brand" routerLink="/" aria-label="NexoTech"><span class="brand-mark">N<span>+</span></span><span class="brand-copy"><strong>nexotech</strong><small>CATÁLOGO ELECTRÓNICO</small></span></a>
      <div class="eyebrow">ACCESO SEGURO</div><h1>{{ registro ? 'Crea tu cuenta' : 'Bienvenido de nuevo' }}</h1>
      <p class="auth-intro">{{ registro ? 'Regístrate para consultar el catálogo NexoTech.' : 'Inicia sesión para administrar el catálogo electrónico.' }}</p>
      <div *ngIf="expirada" class="notice notice-error" role="status">Tu sesión expiró. Inicia sesión nuevamente.</div>
      <div *ngIf="error" class="notice notice-error" role="alert">{{ error }}</div>
      <form [formGroup]="form" (ngSubmit)="enviar()" novalidate>
        <label *ngIf="registro" class="field" for="nombre"><span>Nombre completo</span><input id="nombre" formControlName="nombre" autocomplete="name" maxlength="80" placeholder="Tu nombre"><small *ngIf="form.controls.nombre.invalid && form.controls.nombre.touched" class="field-error">Escribe al menos 2 caracteres.</small></label>
        <label class="field" for="email"><span>Correo electrónico</span><input id="email" type="email" formControlName="email" autocomplete="email" placeholder="nombre@correo.com"><small *ngIf="form.controls.email.invalid && form.controls.email.touched" class="field-error">Escribe un correo válido.</small></label>
      <label class="field" for="password"><span>Contraseña</span><input id="password" type="password" formControlName="password" [autocomplete]="registro ? 'new-password' : 'current-password'" minlength="8" maxlength="72" placeholder="8 a 72 caracteres"><small *ngIf="form.controls.password.invalid && form.controls.password.touched" class="field-error">Usa entre 8 y 72 caracteres.</small></label>
        <button class="button button-primary auth-submit" type="submit" [disabled]="enviando">{{ enviando ? 'Procesando…' : (registro ? 'Crear cuenta' : 'Iniciar sesión') }}</button>
      </form>
      <p class="auth-switch">{{ registro ? '¿Ya tienes una cuenta?' : '¿Aún no tienes cuenta?' }} <a [routerLink]="registro ? '/login' : '/registro'">{{ registro ? 'Inicia sesión' : 'Regístrate' }}</a></p>
      <small class="auth-role-note">Registra primero el correo configurado en ADMIN_EMAIL. Si no se configuró, la primera cuenta será administradora.</small>
    </section></main>
  `
})
export class AuthPageComponent implements OnInit {
  registro = false;
  expirada = false;
  enviando = false;
  error = '';
  private returnUrl = '/';
  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.minLength(2), Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]]
  });

  constructor(private readonly fb: FormBuilder, private readonly route: ActivatedRoute, private readonly router: Router, private readonly auth: AuthService) {}

  ngOnInit(): void {
    this.registro = this.route.snapshot.url[0]?.path === 'registro';
    this.expirada = this.route.snapshot.queryParamMap.has('expired');
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
    if (this.registro) {
      this.form.controls.nombre.addValidators(Validators.required);
      this.form.controls.nombre.updateValueAndValidity();
    }
  }

  enviar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.enviando) return;
    this.enviando = true;
    this.error = '';
    const solicitud = this.registro
      ? this.auth.registrar({ nombre: this.form.controls.nombre.value, email: this.form.controls.email.value, password: this.form.controls.password.value })
      : this.auth.iniciarSesion({ email: this.form.controls.email.value, password: this.form.controls.password.value });
    solicitud.subscribe({
      next: () => { void this.router.navigateByUrl(this.returnUrl.startsWith('/') && !this.returnUrl.startsWith('//') ? this.returnUrl : '/'); },
      error: (error: unknown) => { this.error = mensajeDeError(error); this.enviando = false; }
    });
  }
}
