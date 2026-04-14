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

  //const user: User | null = userJson ? JSON.parse(userJson) : null;
  const user: any = userJson ? JSON.parse(userJson) : null;
  if (!user) return false;

  if (user.role === 'CLIENT') {
    router.navigate(['/dashboard']);
    return false;
  }

  const tieneTaller = user?.workshopId || user?.workShopId || user?.workShop;
  if (user.role === 'MANAGER' && tieneTaller) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
