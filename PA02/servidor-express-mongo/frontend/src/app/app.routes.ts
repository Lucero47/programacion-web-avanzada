import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { ProductFormComponent } from './pages/product-form/product-form.component';
import { AuthPageComponent } from './pages/auth/auth-page.component';
import { UsersComponent } from './pages/users/users.component';
import { authGuard, roleGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: AuthPageComponent, title: 'Iniciar sesión | NexoTech' },
  { path: 'registro', component: AuthPageComponent, title: 'Crear cuenta | NexoTech' },
  { path: '', component: DashboardComponent, canActivate: [authGuard], title: 'Panel general | NexoTech' },
  { path: 'productos', component: ProductListComponent, canActivate: [authGuard], title: 'Catálogo | NexoTech' },
  { path: 'productos/nuevo', component: ProductFormComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'editor'] }, title: 'Nuevo artículo | NexoTech' },
  { path: 'productos/:id/editar', component: ProductFormComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'editor'] }, title: 'Editar artículo | NexoTech' },
  { path: 'usuarios', component: UsersComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin'] }, title: 'Usuarios | NexoTech' },
  { path: '**', redirectTo: '' }
];
