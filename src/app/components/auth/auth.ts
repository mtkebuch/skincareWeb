import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './auth.html',
  styleUrls: ['./auth.css']
})
export class AuthComponent {
  email: string = '';
  password: string = '';
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  emailError: string = '';
  passwordError: string = '';
  rememberMe: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    // თუ უკვე ავტორიზებულია
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }

    // "Remember Me" ფუნქციონალი
    this.loadSavedCredentials();
  }

  onEmailChange() {
    this.emailError = '';
    this.errorMessage = '';
  }

  onPasswordChange() {
    this.passwordError = '';
    this.errorMessage = '';
  }

  async login() {
    this.errorMessage = '';
    this.successMessage = '';

    // ვალიდაცია
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.loading = true;

    // ავტორიზაცია JWT-ით
    const result = this.authService.login(this.email, this.password);
    this.loading = false;
    
    if (result.success) {
      this.successMessage = result.message;

      // "Remember Me" შენახვა
      if (this.rememberMe) {
        this.saveCredentials();
      } else {
        this.clearSavedCredentials();
      }

      // JWT ტოკენის ლოგირება (development-ში)
      if (result.token) {
        console.log('🔑 JWT Token received:', result.token);
      }

      // მომხმარებლის როლის მიხედვით redirect
      const currentUser = this.authService.getCurrentUser();
      setTimeout(() => {
        if (currentUser?.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
      }, 1000);
    } else {
      this.errorMessage = result.message;
    }
  }

  // "Remember Me" ფუნქციონალი
  private saveCredentials() {
    localStorage.setItem('remembered_email', this.email);
  }

  private loadSavedCredentials() {
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      this.email = savedEmail;
      this.rememberMe = true;
    }
  }

  private clearSavedCredentials() {
    localStorage.removeItem('remembered_email');
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }
}