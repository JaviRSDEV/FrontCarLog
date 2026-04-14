import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isApiRequest = req.url.startsWith(environment.apiUrl);

  if (isApiRequest) {
    const peticionClonada = req.clone({
      withCredentials: true,
    });

    return next(peticionClonada);
  }

  return next(req);
};
