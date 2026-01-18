import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  iat: number;
  exp: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private users: User[] = [];
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USERS_KEY = 'registeredUsers';

  constructor(private router: Router) {
    this.loadUsersFromStorage();
  }

  private generateToken(user: User): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
    };

    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = btoa(`${encodedHeader}.${encodedPayload}.SECRET_KEY`);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private decodeToken(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      return JSON.parse(atob(parts[1]));
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  }

  private isTokenValid(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload) return false;
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  }

  login(email: string, password: string): AuthResponse {
    const user = this.users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }

    const token = this.generateToken(user);
    localStorage.setItem(this.TOKEN_KEY, token);

    const { password: _, ...userWithoutPassword } = user;
    console.log('✅ Login successful');
    console.log('👤 User:', userWithoutPassword);
    console.log('🔑 Token:', token);

    return {
      success: true,
      message: 'Login successful!',
      token: token,
      user: user
    };
  }

  register(userData: Omit<User, 'id' | 'createdAt'>): AuthResponse {
    if (this.users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      return { success: false, message: 'Email already registered' };
    }

    const newUser: User = {
      ...userData,
      id: this.generateUserId(),
      createdAt: new Date()
    };

    this.users.push(newUser);
    this.saveUsersToStorage();

    const token = this.generateToken(newUser);
    localStorage.setItem(this.TOKEN_KEY, token);

    console.log('✅ Registration successful');
    console.log('👤 New user:', newUser);

    return {
      success: true,
      message: 'Registration successful!',
      token: token,
      user: newUser
    };
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('cart'); 
    console.log('👋 User logged out');
    
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return false;
    return this.isTokenValid(token);
  }

  getCurrentUser(): User | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token || !this.isTokenValid(token)) return null;

    const payload = this.decodeToken(token);
    if (!payload) return null;

    return this.users.find(u => u.id === payload.userId) || null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  hasRole(role: 'user' | 'admin'): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  getAllUsers(): User[] {
    return this.users;
  }

  getRegisteredUsersCount(): number {
    return this.users.length;
  }

  updatePassword(email: string, newPassword: string): boolean {
    const userIndex = this.users.findIndex(
      u => u.email.toLowerCase() === email.toLowerCase()
    );

    if (userIndex === -1) return false;

    this.users[userIndex].password = newPassword;
    this.saveUsersToStorage();

    console.log('✅ Password updated for:', email);
    return true;
  }

  public loadUsersFromStorage(): void {
    const usersJson = localStorage.getItem(this.USERS_KEY);
    if (usersJson) {
      this.users = JSON.parse(usersJson);
    } else {
      this.users = [
        {
          id: 'admin-001',
          email: 'admin@skincare.com',
          password: 'Admin123!',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          createdAt: new Date()
        }
      ];
      this.saveUsersToStorage();
    }
  }

  private saveUsersToStorage(): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(this.users));
  }

  private generateUserId(): string {
    return 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  refreshToken(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    const token = this.generateToken(user);
    localStorage.setItem(this.TOKEN_KEY, token);

    console.log('🔄 Token refreshed');
    return true;
  }
}