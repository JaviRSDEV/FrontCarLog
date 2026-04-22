import { HttpInterceptorFn, HttpXsrfTokenExtractor } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isApiRequest = req.url.startsWith(environment.apiUrl);

  if (isApiRequest) {
    const xsrfTokenExtractor = inject(HttpXsrfTokenExtractor);
    const xsrfToken = xsrfTokenExtractor.getToken();

    let headers = req.headers;

    if (xsrfToken) {
      headers = headers.set('X-XSRF-TOKEN', xsrfToken);
    }

    const peticionClonada = req.clone({
      withCredentials: true,
      headers: headers,
    });

    return next(peticionClonada);
  }

  return next(req);
};
