import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartService } from './cart.service';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin'; // როლების დამატება
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  exp: number;
  iat: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  
  private tokenKey = 'auth_token';
  private usersStorageKey = 'registered_users';

  constructor(private cartService: CartService) {
    this.initializeAuth();
  }

  // ინიციალიზაცია - ტოკენის შემოწმება
  private initializeAuth(): void {
    const token = this.getToken();
    if (token && this.isTokenValid(token)) {
      const user = this.getUserFromToken(token);
      this.currentUserSubject.next(user);
    } else {
      this.clearAuth();
    }
  }

  // JWT ტოკენის გენერირება (სიმულაცია - რეალურად backend-ზე უნდა ხდებოდეს)
  private generateJWT(user: User): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: now,
      exp: now + (24 * 60 * 60) // 24 საათი
    };

    // Base64 encode (სიმულაცია - რეალურად cryptographic signing უნდა მოხდეს)
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = btoa(`${encodedHeader}.${encodedPayload}.SECRET_KEY`);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  // JWT ტოკენის დეკოდირება
  private decodeJWT(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch {
      return null;
    }
  }

  // ტოკენის ვალიდურობის შემოწმება
  private isTokenValid(token: string): boolean {
    const payload = this.decodeJWT(token);
    if (!payload) return false;

    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  }

  // მომხმარებლის მიღება ტოკენიდან
  private getUserFromToken(token: string): User | null {
    const payload = this.decodeJWT(token);
    if (!payload) return null;

    const users = this.getStoredUsers();
    return users.find(u => u.id === payload.userId) || null;
  }

  // ტოკენის შენახვა
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // ტოკენის მიღება
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // ავტორიზაციის გასუფთავება
  private clearAuth(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }

  // მომხმარებლების შენახვა (პაროლები hash-ირებული უნდა იყოს)
  private getStoredUsers(): User[] {
    const stored = localStorage.getItem(this.usersStorageKey);
    return stored ? JSON.parse(stored) : [];
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(this.usersStorageKey, JSON.stringify(users));
  }

  // პაროლის hash-ირება (სიმულაცია - რეალურად bcrypt უნდა გამოიყენოთ backend-ზე)
  private hashPassword(password: string): string {
    // ეს არის მხოლოდ სიმულაცია! რეალურად bcrypt ან argon2 გამოიყენეთ
    return btoa(password + 'SALT_STRING');
  }

  private verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  // ვალიდაციის მეთოდები
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
    const users = this.getStoredUsers();
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
  }

  // რეგისტრაცია
  register(
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string,
    role: 'user' | 'admin' = 'user'
  ): { success: boolean; message: string; token?: string } {
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
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: role,
      createdAt: new Date()
    };

    // პაროლის hash-ირება და შენახვა ცალკე
    const users = this.getStoredUsers();
    users.push(newUser);
    this.saveUsers(users);

    // პაროლის hash-ების შენახვა (ცალკე სტორეჯში უსაფრთხოებისთვის)
    const passwordHashes = JSON.parse(localStorage.getItem('password_hashes') || '{}');
    passwordHashes[newUser.id] = this.hashPassword(password);
    localStorage.setItem('password_hashes', JSON.stringify(passwordHashes));

    return { success: true, message: 'Registration successful! Please log in.' };
  }

  // ავტორიზაცია
  login(email: string, password: string): { success: boolean; message: string; token?: string } {
    if (!email || !password) {
      return { success: false, message: 'Email and password are required' };
    }

    const users = this.getStoredUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }

    // პაროლის შემოწმება
    const passwordHashes = JSON.parse(localStorage.getItem('password_hashes') || '{}');
    const storedHash = passwordHashes[user.id];

    if (!storedHash || !this.verifyPassword(password, storedHash)) {
      return { success: false, message: 'Invalid email or password' };
    }

    // JWT ტოკენის გენერირება
    const token = this.generateJWT(user);
    this.setToken(token);
    this.currentUserSubject.next(user);

    return { 
      success: true, 
      message: `Welcome back, ${user.firstName}!`,
      token: token
    };
  }

  // გასვლა
  logout(): void {
    this.clearAuth();
    this.cartService.clearCart();
    this.cartService.closeCart();
  }

  // ავტორიზაციის შემოწმება
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && this.isTokenValid(token);
  }

  // მიმდინარე მომხმარებლის მიღება
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // როლის შემოწმება
  hasRole(role: 'user' | 'admin'): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  // ადმინის შემოწმება
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  // ID-ის გენერირება
  private generateUserId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // პაროლის აღდგენა (დაგვჭირდება შემდეგ ეტაპზე)
  requestPasswordReset(email: string): { success: boolean; message: string } {
    const emailError = this.validateEmail(email);
    if (emailError) {
      return { success: false, message: emailError };
    }

    return { 
      success: true, 
      message: 'If an account exists with this email, you will receive password reset instructions.' 
    };
  }

  // სტატისტიკა
  getRegisteredUsersCount(): number {
    return this.getStoredUsers().length;
  }
}