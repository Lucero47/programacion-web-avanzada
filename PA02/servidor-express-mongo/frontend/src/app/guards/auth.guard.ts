import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.asegurarSesion().pipe(map((usuario) => usuario ? true : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } })));
};

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.asegurarSesion().pipe(map((usuario) => {
    if (!usuario) return router.createUrlTree(['/login']);
    const roles = route.data['roles'] as string[];
    return roles.includes(usuario.rol) ? true : router.createUrlTree(['/']);
  }));
};
