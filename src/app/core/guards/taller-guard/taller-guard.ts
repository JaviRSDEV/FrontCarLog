import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { User } from '../../../models/user';
import { Auth } from '../../../services/authService/auth.service';
export const tallerGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(Auth);

  const userJson = authService.getUserFromStorage();

  if (!userJson) {
    return router.createUrlTree(['/']);
  }

  try {
    const user: User = JSON.parse(userJson);

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
  } catch (error) {
    console.error('JSON de usuario corrupto detectado en el Guard:', error);
    authService.logout();
    return router.createUrlTree(['/']);
  }
};
