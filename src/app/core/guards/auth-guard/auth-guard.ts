import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authguardGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = sessionStorage.getItem('auth_token') || document.cookie.includes('auth_token');

  console.log("AUTH-GUARD", !!token);

  if(!token){
    console.log("AUTH-GUARD: No hay token ")
    router.navigate(['/']);
    return false;
  }

  console.log("AUTH-GUARD Hay token")
  return true;
};
