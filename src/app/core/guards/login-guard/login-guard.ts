import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const loginGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = sessionStorage.getItem('auth_token') || document.cookie.includes('auth_token=');

  if (token) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
