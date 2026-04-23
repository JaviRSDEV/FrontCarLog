import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import Swal from 'sweetalert2';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let mensajeParaMostrar = error.error?.message;

      if (!mensajeParaMostrar) {
        if (error.status === 500) {
          mensajeParaMostrar = 'Error interno del servidor (500)';
        } else if (error.status === 0) {
          mensajeParaMostrar = 'No hay conexión con el servidor o la petición fue cancelada';
        } else {
          mensajeParaMostrar = 'Ha ocurrido un error inesperado';
        }
      }

      if (req.url.includes('/authenticate') || req.url.includes('/register')) {
        return throwError(() => error);
      }

      const swalBaseConfig = {
        background: '#212529',
        color: '#fff',
        confirmButtonColor: '#0d6efd',
      };

      switch (error.status) {
        case 401:
          console.warn('401 detectado: Limpiando rastro de usuario...');
          limpiarSesionLocal(router);

          Swal.fire({
            ...swalBaseConfig,
            icon: 'error',
            title: 'Acceso denegado',
            text: 'Sesión caducada o credenciales incorrectas.',
            confirmButtonColor: '#dc3545',
          });
          break;

        case 403:
          Swal.fire({
            ...swalBaseConfig,
            title: 'Acceso Denegado',
            text: mensajeParaMostrar,
            icon: 'warning',
            confirmButtonText: 'Entendido',
          }).then(() => {
            const msgLower = mensajeParaMostrar.toLowerCase();
            if (msgLower.includes('taller') || msgLower.includes('sesión')) {
              limpiarSesionLocal(router);
            }
          });
          break;

        case 429:
          Swal.fire({
            ...swalBaseConfig,
            icon: 'warning',
            title: '¡Demasiados intentos!',
            text: mensajeParaMostrar,
          });
          break;

        default:
          Swal.fire({
            ...swalBaseConfig,
            title: 'Atención',
            text: mensajeParaMostrar,
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
          break;
      }

      return throwError(() => error);
    }),
  );
};

function limpiarSesionLocal(router: Router) {
  localStorage.removeItem('user');
  sessionStorage.removeItem('user');
  router.navigate(['/']);
}
