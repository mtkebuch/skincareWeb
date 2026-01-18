import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

// JWT Interceptor - ავტომატურად ამატებს Authorization header-ს ყველა HTTP მოთხოვნას
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // ვიღებთ ტოკენს
  const token = authService.getToken();

  // თუ ტოკენი არსებობს და ვალიდურია, ვამატებთ Authorization header-ს
  if (token && authService.isAuthenticated()) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // ვაგზავნით მოთხოვნას და ვამუშავებთ შეცდომებს
  return next(req).pipe(
    catchError((error) => {
      // 401 Unauthorized - ტოკენი არავალიდურია ან ვადაგასულია
      if (error.status === 401) {
        console.error('🔒 Unauthorized - Token expired or invalid');
        authService.logout();
        router.navigate(['/login']);
      }

      // 403 Forbidden - არ აქვს უფლება
      if (error.status === 403) {
        console.error('🚫 Forbidden - Access denied');
        alert('Access denied. You do not have permission to perform this action.');
        router.navigate(['/']);
      }

      return throwError(() => error);
    })
  );
};