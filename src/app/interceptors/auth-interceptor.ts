import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isApiRequest = req.url.includes('http://localhost:8081');
  console.log('🕵️ Interceptor evaluando:', req.url); // 👈 Chivato 1
  if (isApiRequest) {
    console.log('✅ Añadiendo credenciales a:', req.url); // 👈 Chivato 2
    const peticionClonada = req.clone({
      withCredentials: true,
    });

    return next(peticionClonada);
  }

  return next(req);
};
