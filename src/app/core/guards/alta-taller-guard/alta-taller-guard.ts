import { CanActivateFn, Router } from '@angular/router';
import { User } from '../../../models/user';
import { inject } from '@angular/core';

export const altaTallerGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userJson = localStorage.getItem('user') || sessionStorage.getItem('user');
  const user: User | null = userJson ? JSON.parse(userJson) : null;

  if (!user) {
    return router.createUrlTree(['/']);
  }

  const role = (user.role || '').toString().toUpperCase();
  const tieneTaller = !!(user.workshop || user.workShopId);

  if (role === 'CLIENT') {
    return router.createUrlTree(['/dashboard']);
  }

  if ((role === 'MANAGER' || role === 'CO_MANAGER') && tieneTaller) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
