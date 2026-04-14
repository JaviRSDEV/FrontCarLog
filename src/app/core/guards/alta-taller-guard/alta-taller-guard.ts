import { CanActivateFn, Router } from '@angular/router';
import { User } from '../../../models/user';
import { inject } from '@angular/core';

export const altaTallerGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  let userJson = localStorage.getItem('user');

  if (!userJson) {
    const cookieMatch = document.cookie.match(/(^|;)\s*user_data\s*=\s*([^;]+)/);
    if (cookieMatch) userJson = decodeURIComponent(cookieMatch[2]);
  }

  const user: User | null = userJson ? JSON.parse(userJson) : null;

  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  if (user.role === 'CLIENT') {
    router.navigate(['/dashboard']);
    return false;
  }

  const tieneTaller = !!(user.workShopId || user.workShop);

  if ((user.role === 'MANAGER' || user.role === 'CO_MANAGER') && tieneTaller) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
