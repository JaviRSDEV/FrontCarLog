import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  let token = sessionStorage.getItem('auth_token');

  if(!token){
    const match = document.cookie.match(/(^|;)\s*auth_token\s*=\s*([^;]+)/);
    token = match ? match[2] : null;
  }

  if(token){
    const peticionClonada = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(peticionClonada);
  }

  return next(req);
};
