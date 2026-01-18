import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

// ძირითადი ავტორიზაციის Guard
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // არაავტორიზებული მომხმარებლები გადადიან login-ზე
  router.navigate(['/login']);
  return false;
};

// Guest Guard - მხოლოდ გაუსულებელი მომხმარებლებისთვის
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  // ავტორიზებული მომხმარებლები გადადიან მთავარ გვერდზე
  router.navigate(['/']);
  return false;
};

// Admin Guard - მხოლოდ ადმინებისთვის
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // პირველ რიგში ვამოწმებთ ავტორიზაციას
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // შემდეგ ვამოწმებთ ადმინის როლს
  if (authService.isAdmin()) {
    return true;
  }

  // არა-ადმინები გადადიან მთავარ გვერდზე
  alert('Access denied. Admin privileges required.');
  router.navigate(['/']);
  return false;
};

// User Guard - მხოლოდ რეგულარული მომხმარებლებისთვის (არა ადმინებისთვის)
export const userGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (authService.hasRole('user')) {
    return true;
  }

  router.navigate(['/']);
  return false;
};

// Role-based Guard Factory - ნებისმიერი როლისთვის
export const roleGuard = (allowedRoles: ('user' | 'admin')[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }

    const currentUser = authService.getCurrentUser();
    if (currentUser && allowedRoles.includes(currentUser.role)) {
      return true;
    }

    alert('Access denied. You do not have permission to access this page.');
    router.navigate(['/']);
    return false;
  };
};