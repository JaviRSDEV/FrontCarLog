import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const tallerGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  let userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  if(!user){
    console.log("Usuario no encontrado eliminando cookie");
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.navigate(['/']);
    return false;
  }

  if(user.role === 'MANAGER' && !user.workshop?.workshopName){
    router.navigate(['/dashboard/alta-taller']);
    return false;
  }

  return true;
};
