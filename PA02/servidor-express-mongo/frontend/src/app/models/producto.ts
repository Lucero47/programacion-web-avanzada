export interface Producto {
  _id: string;
  nombre: string;
  categoria?: string;
  descripcion?: string;
  precio: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductoPayload {
  nombre: string;
  categoria: string;
  descripcion: string;
  precio: number;
}

export interface RespuestaProducto {
  mensaje: string;
  producto: Producto;
}

export interface RespuestaApi {
  mensaje: string;
}
