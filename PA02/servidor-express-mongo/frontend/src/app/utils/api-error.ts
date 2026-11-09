import { HttpErrorResponse } from '@angular/common/http';

export const mensajeDeError = (error: unknown): string => {
  if (error instanceof HttpErrorResponse) {
    const body: unknown = error.error;
    if (typeof body === 'object' && body !== null && 'mensaje' in body) {
      const mensaje = (body as { mensaje: unknown }).mensaje;
      if (typeof mensaje === 'string') return mensaje;
    }
    if (error.status === 0) return 'No se pudo conectar con el servidor. Revisa que Express y MongoDB estén activos.';
  }

  return 'Ocurrió un error al procesar la solicitud. Inténtalo nuevamente.';
};
