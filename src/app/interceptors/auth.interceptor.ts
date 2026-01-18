import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  
  const token = authService.getToken();

  
  if (token && authService.isAuthenticated()) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  
  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        console.error('🔒 Unauthorized - Token expired or invalid');
        authService.logout();
        router.navigate(['/login']);
      }

     
      if (error.status === 403) {
        console.error('🚫 Forbidden - Access denied');
        alert('Access denied. You do not have permission to perform this action.');
        router.navigate(['/']);
      }

      return throwError(() => error);
    })
  );
};