import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

function getCookie(name: string): string | null {
  const matches = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'),
  );
  return matches ? decodeURIComponent(matches[1]) : null;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isApiRequest = req.url.startsWith(environment.apiUrl);

  if (isApiRequest) {
    const xsrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1];

    let headers = req.headers;

    if (xsrfToken) {
      headers = headers.set('X-XSRF-TOKEN', decodeURIComponent(xsrfToken));
    }

    const peticionClonada = req.clone({
      withCredentials: true,
      headers: headers,
    });

    return next(peticionClonada);
  }

  return next(req);
};
