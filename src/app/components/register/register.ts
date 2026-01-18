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

  
  firstNameError: string = '';
  lastNameError: string = '';
  emailError: string = '';
  passwordError: string = '';
  confirmPasswordError: string = '';

  
  passwordRequirements = {
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false
  };

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }



  validateFirstNameField() {
    if (!this.firstName) {
      this.firstNameError = 'First name is required';
    } else if (this.firstName.length < 2) {
      this.firstNameError = 'First name must be at least 2 characters';
    } else {
      this.firstNameError = '';
    }
  }

  validateLastNameField() {
    if (!this.lastName) {
      this.lastNameError = 'Last name is required';
    } else if (this.lastName.length < 2) {
      this.lastNameError = 'Last name must be at least 2 characters';
    } else {
      this.lastNameError = '';
    }
  }

  validateEmailField() {
    if (!this.email) {
      this.emailError = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        this.emailError = 'Please enter a valid email address';
      } else {
        this.emailError = '';
      }
    }
  }

  validatePasswordField() {
    if (!this.password) {
      this.passwordError = 'Password is required';
    } else if (!this.isPasswordValid()) {
      this.passwordError = 'Password does not meet all requirements';
    } else {
      this.passwordError = '';
    }
  }

  validateConfirmPasswordField() {
    if (!this.confirmPassword) {
      this.confirmPasswordError = 'Please confirm your password';
    } else if (this.password !== this.confirmPassword) {
      this.confirmPasswordError = 'Passwords do not match';
    } else {
      this.confirmPasswordError = '';
    }
  }



  onPasswordChange() {
    this.errorMessage = '';
    this.passwordError = '';
    this.updatePasswordRequirements();
    
   
    if (this.confirmPassword) {
      this.validateConfirmPasswordField();
    }
  }

  onConfirmPasswordChange() {
    this.errorMessage = '';
    this.confirmPasswordError = '';
    
    
    if (this.confirmPassword) {
      this.validateConfirmPasswordField();
    }
  }

  updatePasswordRequirements() {
    this.passwordRequirements = {
      minLength: this.password.length >= 8,
      hasUppercase: /[A-Z]/.test(this.password),
      hasLowercase: /[a-z]/.test(this.password),
      hasNumber: /[0-9]/.test(this.password),
      hasSpecial: /[!@#$%^&*]/.test(this.password)
    };
  }

  isPasswordValid(): boolean {
    return Object.values(this.passwordRequirements).every(req => req === true);
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
      this.errorMessage = 'Please fix all errors before submitting';
      return;
    }

    this.loading = true;

    
    const result = this.authService.register({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      role: 'user'
    });

    this.loading = false;

    if (result.success) {
      this.successMessage = result.message;

      if (result.token) {
        console.log('🔑 JWT Token received:', result.token);
      }

      setTimeout(() => {
        this.router.navigate(['/']);
      }, 1000);
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

export default RegisterComponent;