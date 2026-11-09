import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto, ProductoPayload, RespuestaApi, RespuestaProducto } from '../models/producto';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly apiUrl = '/api/productos';

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  obtener(id: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  crear(datos: ProductoPayload): Observable<RespuestaProducto> {
    return this.http.post<RespuestaProducto>(this.apiUrl, datos);
  }

  actualizar(id: string, datos: ProductoPayload): Observable<RespuestaProducto> {
    return this.http.put<RespuestaProducto>(`${this.apiUrl}/${id}`, datos);
  }

  eliminar(id: string): Observable<RespuestaApi> {
    return this.http.delete<RespuestaApi>(`${this.apiUrl}/${id}`);
  }
}
