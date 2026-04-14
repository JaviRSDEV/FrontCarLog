import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const tallerGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const userJson = localStorage.getItem('user');

  const user: any = userJson ? JSON.parse(userJson) : null;

  if (!user) {
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.navigate(['/']);
    return false;
  }

  const tieneTaller = user?.workshopId || user?.workShopId || user?.workShop;

  if (user.role === 'MANAGER' && !tieneTaller) {
    router.navigate(['/dashboard/alta-taller']);
    return false;
  }

  return true;
};
