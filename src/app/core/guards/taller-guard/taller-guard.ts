import { CanActivateFn, Router } from '@angular/router';
import { User } from '../../../models/user';
import { inject } from '@angular/core';

export const tallerGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const userJson = localStorage.getItem('user');
  const user: User | null = userJson ? JSON.parse(userJson) : null;

  if (!user) {
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.navigate(['/']);
    return false;
  }

  const tieneTaller = !!(user.workShopId || user.workShop);

  if ((user.role === 'MANAGER' || user.role === 'CO_MANAGER') && !tieneTaller) {
    router.navigate(['/dashboard/alta-taller']);
    return false;
  }

  return true;
};
