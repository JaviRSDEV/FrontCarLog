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

      if (error.status === 401 || error.error?.message === 'Bad credentials') {
        console.warn('401/Login fallido detectado: Limpiando rastro de usuario...');

        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        router.navigate(['/login']);

        Swal.fire({
          icon: 'error',
          title: 'Acceso denegado',
          text: 'Correo o contraseña incorrectos, o sesión caducada.',
          background: '#212529',
          color: '#fff',
          confirmButtonColor: '#dc3545',
        });
      } else if (error.status === 429) {
        Swal.fire({
          icon: 'warning',
          title: '¡Demasiados intentos!',
          text: error.error?.message || 'Por favor, espera 1 minuto antes de volver a intentarlo.',
          background: '#212529',
          color: '#fff',
          confirmButtonColor: '#0d6efd',
        });
      } else if (error.status === 403) {
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
            router.navigate(['/login']);
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
