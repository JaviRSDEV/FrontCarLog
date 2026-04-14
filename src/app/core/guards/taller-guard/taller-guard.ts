import { CanActivateFn, Router } from '@angular/router';
import { User } from '../../../models/user';
import { inject } from '@angular/core';

export const tallerGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userJson = localStorage.getItem('user') || sessionStorage.getItem('user');
  const user: User | null = userJson ? JSON.parse(userJson) : null;

  if (!user) {
    return router.createUrlTree(['/']);
  }

  if (state.url.includes('/alta-taller')) {
    return true;
  }

  const tieneTaller = !!(user.workshop || user.workShopId);
  const role = (user.role || '').toString().toUpperCase();
  const esJefe = role === 'MANAGER' || role === 'CO_MANAGER';

  if (esJefe && !tieneTaller) {
    return router.createUrlTree(['/dashboard/alta-taller']);
  }

  return true;
};
