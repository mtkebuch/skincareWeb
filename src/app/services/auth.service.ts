import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartService } from './cart.service'; 

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface PasswordResetToken {
  email: string;
  token: string;
  expiresAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private users: User[] = [];
  private resetTokens: PasswordResetToken[] = [];
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(private cartService: CartService) { 
    this.loadUsersFromStorage();
    this.loadCurrentUser();
    this.loadResetTokens();
  }

  private loadUsersFromStorage(): void {
    const storedUsers = localStorage.getItem('registeredUsers');
    if (storedUsers) {
      this.users = JSON.parse(storedUsers);
    }
  }

  private saveUsersToStorage(): void {
    localStorage.setItem('registeredUsers', JSON.stringify(this.users));
  }

  private loadCurrentUser(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  private loadResetTokens(): void {
    const storedTokens = localStorage.getItem('resetTokens');
    if (storedTokens) {
      this.resetTokens = JSON.parse(storedTokens).map((token: any) => ({
        ...token,
        expiresAt: new Date(token.expiresAt)
      }));
    }
  }

  private saveResetTokens(): void {
    localStorage.setItem('resetTokens', JSON.stringify(this.resetTokens));
  }

  validateEmail(email: string): string | null {
    if (!email || email.trim().length === 0) {
      return 'Email is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }

    return null;
  }

  validatePassword(password: string): string | null {
    if (!password || password.trim().length === 0) {
      return 'Password is required';
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }

    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }

    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }

    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }

    if (!/[!@#$%^&*]/.test(password)) {
      return 'Password must contain at least one special character (!@#$%^&*)';
    }

    return null;
  }

  validateName(name: string, fieldName: string): string | null {
    if (!name || name.trim().length === 0) {
      return `${fieldName} is required`;
    }

    if (name.length < 2) {
      return `${fieldName} must be at least 2 characters long`;
    }

    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return `${fieldName} can only contain letters`;
    }

    return null;
  }

  emailExists(email: string): boolean {
    return this.users.some(user => user.email.toLowerCase() === email.toLowerCase());
  }

  register(email: string, password: string, firstName: string, lastName: string): { success: boolean; message: string } {
    const emailError = this.validateEmail(email);
    if (emailError) {
      return { success: false, message: emailError };
    }

    if (this.emailExists(email)) {
      return { success: false, message: 'An account with this email already exists' };
    }

    const passwordError = this.validatePassword(password);
    if (passwordError) {
      return { success: false, message: passwordError };
    }

    const firstNameError = this.validateName(firstName, 'First name');
    if (firstNameError) {
      return { success: false, message: firstNameError };
    }

    const lastNameError = this.validateName(lastName, 'Last name');
    if (lastNameError) {
      return { success: false, message: lastNameError };
    }

    const newUser: User = {
      id: this.generateUserId(),
      email: email.toLowerCase(),
      password: password, 
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      createdAt: new Date()
    };

    this.users.push(newUser);
    this.saveUsersToStorage();

    return { success: true, message: 'Registration successful! Please log in.' };
  }

  login(email: string, password: string): { success: boolean; message: string } {
    if (!email || !password) {
      return { success: false, message: 'Email and password are required' };
    }

    const user = this.users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      return { success: false, message: 'Invalid email or password. Please check your credentials or create an account.' };
    }

    this.currentUserSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));

    return { success: true, message: `Welcome back, ${user.firstName}!` };
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
    
    
    this.cartService.clearCart();
    this.cartService.closeCart();
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  
  requestPasswordReset(email: string): { success: boolean; message: string } {
    const emailError = this.validateEmail(email);
    if (emailError) {
      return { success: false, message: emailError };
    }

    const userExists = this.emailExists(email);
    
   
    if (!userExists) {
      return { 
        success: true, 
        message: 'If an account exists with this email, you will receive password reset instructions.' 
      };
    }

   
    const token = this.generateResetToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); 

    
    this.resetTokens = this.resetTokens.filter(t => t.email.toLowerCase() !== email.toLowerCase());

  
    this.resetTokens.push({
      email: email.toLowerCase(),
      token: token,
      expiresAt: expiresAt
    });

    this.saveResetTokens();

    
    console.log(`Password reset token for ${email}: ${token}`);
    console.log(`Reset link: /forgot-password?token=${token}`);

    return { 
      success: true, 
      message: 'If an account exists with this email, you will receive password reset instructions.' 
    };
  }

  validateResetToken(token: string): { valid: boolean; email?: string; message?: string } {
    const resetToken = this.resetTokens.find(t => t.token === token);

    if (!resetToken) {
      return { valid: false, message: 'Invalid or expired reset token' };
    }

    
    if (new Date() > new Date(resetToken.expiresAt)) {
      
      this.resetTokens = this.resetTokens.filter(t => t.token !== token);
      this.saveResetTokens();
      return { valid: false, message: 'This reset link has expired. Please request a new one.' };
    }

    return { valid: true, email: resetToken.email };
  }

  resetPassword(token: string, newPassword: string): { success: boolean; message: string } {
    const tokenValidation = this.validateResetToken(token);
    
    if (!tokenValidation.valid) {
      return { success: false, message: tokenValidation.message || 'Invalid token' };
    }

    const passwordError = this.validatePassword(newPassword);
    if (passwordError) {
      return { success: false, message: passwordError };
    }

    const user = this.users.find(u => u.email.toLowerCase() === tokenValidation.email?.toLowerCase());
    
    if (!user) {
      return { success: false, message: 'User not found' };
    }

 
    user.password = newPassword;
    this.saveUsersToStorage();

    
    this.resetTokens = this.resetTokens.filter(t => t.token !== token);
    this.saveResetTokens();

    return { success: true, message: 'Your password has been successfully reset. You can now log in with your new password.' };
  }

 
  private generateUserId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private generateResetToken(): string {
    return 'reset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16);
  }

  
  getRegisteredUsersCount(): number {
    return this.users.length;
  }
}