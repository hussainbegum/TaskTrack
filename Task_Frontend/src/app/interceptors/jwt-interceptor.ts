import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const isAuthApi = req.url.includes('/auth/forgot-password') ||
                  req.url.includes('/auth/reset-password') ||
                  req.url.includes('/auth/login') ||
                  req.url.includes('/auth/signup');

if (req.method === 'OPTIONS' || isAuthApi) {
  console.log("Skipping token for:", req.url); 
  return next(req);
}

  const token = authService.getToken();

  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  }

  return next(req);
};