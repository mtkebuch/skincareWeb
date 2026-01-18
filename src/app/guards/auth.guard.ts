import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';


export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

 
  router.navigate(['/login'], { 
    queryParams: { returnUrl: state.url }
  });
  return false;
};


export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  
  router.navigate(['/']);
  return false;
};


export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

 
  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  
  if (authService.isAdmin()) {
    return true;
  }

  
  console.warn('Access denied. Admin privileges required.');
  router.navigate(['/']);
  return false;
};


export const userGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  if (authService.hasRole('user')) {
    return true;
  }

  router.navigate(['/']);
  return false;
};


export const roleGuard = (allowedRoles: ('user' | 'admin')[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/login'], { 
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    const currentUser = authService.getCurrentUser();
    if (currentUser && allowedRoles.includes(currentUser.role)) {
      return true;
    }

    console.warn('Access denied. You do not have permission to access this page.');
    router.navigate(['/']);
    return false;
  };
};