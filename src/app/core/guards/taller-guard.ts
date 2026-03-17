import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const tallerGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const userJson = sessionStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  const isManager = user?.role === 'MANAGER';
  const tieneTaller = !!user?.workshop;

  if(isManager && !tieneTaller){
    router.navigate(['dashboard/alta-taller']);
    return false;
  }

  return true;
};
