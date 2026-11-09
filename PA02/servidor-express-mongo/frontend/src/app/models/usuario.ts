export enum RolUsuario {
  Admin = 'admin',
  Editor = 'editor',
  Viewer = 'viewer'
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  createdAt?: string;
}

export interface RespuestaAuth {
  mensaje: string;
  token: string;
  usuario: Usuario;
}
