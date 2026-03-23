import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { User } from '../../../models/user';

export const tallerGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const userJson = localStorage.getItem('user');

  const user: User | null = userJson ? JSON.parse(userJson) : null;

  console.log("=== EL OBJETO ENTERO ES ===", user);
  console.log("=== EL TALLER ES ===", user?.workShop);

  if(!user){
    console.log("Usuario no encontrado eliminando cookie");
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.navigate(['/']);
    return false;
  }

  if(user.role === 'MANAGER' && !user?.workShop){
    router.navigate(['/dashboard/alta-taller']);
    return false;
  }

  return true;
};
