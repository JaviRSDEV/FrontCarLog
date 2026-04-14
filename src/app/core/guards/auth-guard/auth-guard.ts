import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authguardGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userJson = localStorage.getItem('user') || sessionStorage.getItem('user');

  if (!userJson) {
    return router.createUrlTree(['/']);
  }

  return true;
};
