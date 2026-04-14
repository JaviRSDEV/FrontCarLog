import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import Swal from 'sweetalert2';

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
        mensajeParaMostrar = 'No hay conexión con el servidor o la petición fue cancelada';
      }

      if (error.status === 401) {
        console.warn('401 detectado: Limpiando rastro de usuario...');

        localStorage.removeItem('user');
        sessionStorage.removeItem('user');

        router.navigate(['/']);

        return throwError(() => error);
      }

      if (error.status === 403) {
        Swal.fire({
          title: 'Acceso Denegado',
          text: mensajeParaMostrar,
          icon: 'warning',
          background: '#212529',
          color: '#fff',
          confirmButtonColor: '#0d6efd',
          confirmButtonText: 'Entendido',
        }).then(() => {
          const msgLower = mensajeParaMostrar.toLowerCase();
          if (msgLower.includes('taller') || msgLower.includes('sesión')) {
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');

            router.navigate(['/']);
          }
        });
      } else {
        Swal.fire({
          title: 'Atención',
          text: mensajeParaMostrar,
          icon: 'error',
          background: '#212529',
          color: '#fff',
          confirmButtonColor: '#0d6efd',
          confirmButtonText: 'Aceptar',
        });
      }

      return throwError(() => error);
    }),
  );
};
