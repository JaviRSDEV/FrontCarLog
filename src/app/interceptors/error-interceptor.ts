import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 403) {
        console.warn('Acceso denegado o permisos revocados. Limpiando sesión...');

        localStorage.removeItem('user');
        sessionStorage.clear();

        router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};
