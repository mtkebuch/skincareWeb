import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['../auth/auth.css']
})
export class RegisterComponent {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  emailError: string = '';
  passwordError: string = '';
  firstNameError: string = '';
  lastNameError: string = '';
  confirmPasswordError: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  validateEmailField() {
    this.emailError = this.authService.validateEmail(this.email) || '';
    
    if (!this.emailError && this.authService.emailExists(this.email)) {
      this.emailError = 'An account with this email already exists';
    }
  }

  validatePasswordField() {
    this.passwordError = this.authService.validatePassword(this.password) || '';
    this.validateConfirmPasswordField();
  }

  validateFirstNameField() {
    this.firstNameError = this.authService.validateName(this.firstName, 'First name') || '';
  }

  validateLastNameField() {
    this.lastNameError = this.authService.validateName(this.lastName, 'Last name') || '';
  }

  validateConfirmPasswordField() {
    if (this.confirmPassword && this.password !== this.confirmPassword) {
      this.confirmPasswordError = 'Passwords do not match';
    } else {
      this.confirmPasswordError = '';
    }
  }

  async register() {
    this.errorMessage = '';
    this.successMessage = '';

    this.validateFirstNameField();
    this.validateLastNameField();
    this.validateEmailField();
    this.validatePasswordField();
    this.validateConfirmPasswordField();

    if (this.firstNameError || this.lastNameError || this.emailError || 
        this.passwordError || this.confirmPasswordError) {
      this.errorMessage = 'Please fix the errors above';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.loading = true;

    const result = this.authService.register(
      this.email,
      this.password,
      this.firstName,
      this.lastName
    );

    this.loading = false;

    if (result.success) {
      this.successMessage = result.message;
      this.router.navigate(['/login']);
    } else {
      this.errorMessage = result.message;
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }
}