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

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
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

    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.loading = true;

    const result = this.authService.login(this.email, this.password);
    this.loading = false;
    
    if (result.success) {
      this.successMessage = result.message;
      this.router.navigate(['/']);
    } else {
      this.errorMessage = result.message;
    }
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