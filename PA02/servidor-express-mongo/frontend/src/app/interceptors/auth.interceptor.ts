import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token;
  const autenticacionPublica = request.url.endsWith('/api/auth/login') || request.url.endsWith('/api/auth/registro');
  const autorizada = token && request.url.startsWith('/api/') && !autenticacionPublica
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;
  return next(autorizada).pipe(catchError((error: unknown) => {
    const status = (error as { status?: number }).status;
    if (status === 401 && token && !autenticacionPublica) {
      auth.limpiarSesionLocal();
      void router.navigate(['/login'], { queryParams: { expired: '1' } });
    }
    return throwError(() => error);
  }));
};
