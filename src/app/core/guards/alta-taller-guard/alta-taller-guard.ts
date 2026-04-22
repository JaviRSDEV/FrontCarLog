import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { User } from '../../../models/user';
import { Auth } from '../../../services/authService/auth.service';

export const altaTallerGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(Auth);

  const userJson = authService.getUserFromStorage();

  if (!userJson) {
    return router.createUrlTree(['/']);
  }

  try {
    const user: User = JSON.parse(userJson);

    const role = (user.role || '').toString().toUpperCase();
    const tieneTaller = !!(user.workshop || user.workShopId);

    if (role === 'CLIENT') {
      return router.createUrlTree(['/dashboard']);
    }

    if ((role === 'MANAGER' || role === 'CO_MANAGER') && tieneTaller) {
      return router.createUrlTree(['/dashboard']);
    }

    return true;
  } catch (error) {
    console.error('JSON de usuario corrupto detectado en altaTallerGuard:', error);
    authService.logout();
    return router.createUrlTree(['/']);
  }
};
