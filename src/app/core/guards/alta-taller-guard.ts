import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const altaTallerGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  let userJson = sessionStorage.getItem('user');
  if(!userJson){
    const cookieMatch = document.cookie.match(/(^|;)\s*user_data\s*=\s*([^;]+)/);
    if(cookieMatch) userJson = decodeURIComponent(cookieMatch[2]);
  }

  const user = userJson ? JSON.parse(userJson) : null;

  if(!user) return false;

  if(user.role === 'CLIENT'){
    router.navigate(['/dashboard']);
    return false;
  }

  if(user.role === 'MANAGER' && !!user.workshop?.workshopName){
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
