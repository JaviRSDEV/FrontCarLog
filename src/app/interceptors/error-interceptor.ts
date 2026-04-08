import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let mensajeParaMostrar = 'Ha ocurrido un error inesperado';

      if (error.error && error.error.message) {
        mensajeParaMostrar = error.error.message;
      } else if (error.status === 500) {
        mensajeParaMostrar = 'Error interno del servidor (500)';
      } else if (error.status === 0) {
        mensajeParaMostrar = 'No hay conexión con el servidor';
      }

      if (error.status === 403) {
        alert(`🚫 Acceso denegado: ${mensajeParaMostrar}`);

        if (
          mensajeParaMostrar.toLowerCase().includes('taller') ||
          mensajeParaMostrar.toLowerCase().includes('sesión')
        ) {
          localStorage.removeItem('user');
          sessionStorage.clear();
          router.navigate(['/login']);
        }
      } else {
        alert(`⚠️ ${mensajeParaMostrar}`);
      }

      return throwError(() => error);
    }),
  );
};
