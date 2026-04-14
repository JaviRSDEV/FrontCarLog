import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isApiRequest = req.url.includes('http://localhost:8081');
  if (isApiRequest) {
    const peticionClonada = req.clone({
      withCredentials: true,
    });

    return next(peticionClonada);
  }

  return next(req);
};
