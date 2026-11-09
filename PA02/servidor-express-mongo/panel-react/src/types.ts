export enum Rol { Admin = 'admin', Editor = 'editor', Viewer = 'viewer' }

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  createdAt?: string;
}

export interface Producto {
  _id: string;
  nombre: string;
  categoria: string;
  descripcion?: string;
  precio: number;
  updatedAt?: string;
}

export interface AuthResponse { token: string; usuario: Usuario; mensaje: string }
export interface ProductoPayload { nombre: string; categoria: string; descripcion: string; precio: number }
