import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const tallerGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const role = sessionStorage.getItem('user_role') || 'MANAGER';
  const tieneTaller = false;

  if(role == 'MANAGER' && !tieneTaller){
    router.navigate(['dashboard/alta-taller']);
    return false;
  }

  return true;
};
