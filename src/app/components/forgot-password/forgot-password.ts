import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['../auth/auth.css']
})
export class ForgotPasswordComponent implements OnInit {
  // View mode: 'request', 'verify', or 'reset'
  mode: 'request' | 'verify' | 'reset' = 'request';
  
  // Request password reset fields
  email: string = '';
  
  // Verification code
  verificationCode: string = '';
  enteredCode: string = '';
  
  // Reset password fields
  newPassword: string = '';
  confirmPassword: string = '';
  
  // UI states
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Password requirements
  passwordRequirements = {
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.mode = 'request';
  }

  // ==================== REQUEST PASSWORD RESET ====================
  
  requestReset() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email) {
      this.errorMessage = 'Please enter your email address';
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    // Generate 6-digit verification code
    this.verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Log to console
    console.log('═══════════════════════════════════════');
    console.log('📧 PASSWORD RESET VERIFICATION CODE');
    console.log('═══════════════════════════════════════');
    console.log('Email:', this.email);
    console.log('Code:', this.verificationCode);
    console.log('═══════════════════════════════════════');

    // Instant transition to verify mode
    this.mode = 'verify';
  }

  // ==================== VERIFY CODE ====================
  
  verifyCode() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.enteredCode) {
      this.errorMessage = 'Please enter the verification code';
      return;
    }

    if (this.enteredCode !== this.verificationCode) {
      this.errorMessage = 'Invalid verification code. Please try again.';
      return;
    }

    // Instant transition to reset mode
    this.mode = 'reset';
  }

  resendCode() {
    this.enteredCode = '';
    this.errorMessage = '';
    
    // Generate new code
    this.verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log('═══════════════════════════════════════');
    console.log('📧 NEW VERIFICATION CODE');
    console.log('═══════════════════════════════════════');
    console.log('Email:', this.email);
    console.log('Code:', this.verificationCode);
    console.log('═══════════════════════════════════════');
    
    this.successMessage = 'New code sent! Check console.';
    
    setTimeout(() => {
      this.successMessage = '';
    }, 1500);
  }

  // ==================== RESET PASSWORD ====================
  
  onPasswordChange() {
    this.errorMessage = '';
    this.updatePasswordRequirements();
  }

  updatePasswordRequirements() {
    this.passwordRequirements = {
      minLength: this.newPassword.length >= 8,
      hasUppercase: /[A-Z]/.test(this.newPassword),
      hasLowercase: /[a-z]/.test(this.newPassword),
      hasNumber: /[0-9]/.test(this.newPassword),
      hasSpecial: /[!@#$%^&*]/.test(this.newPassword)
    };
  }

  isPasswordValid(): boolean {
    return Object.values(this.passwordRequirements).every(req => req === true);
  }

  resetPassword() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (!this.isPasswordValid()) {
      this.errorMessage = 'Password does not meet all requirements';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    // Update password directly through localStorage AND reload AuthService
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const userIndex = users.findIndex((u: any) => u.email.toLowerCase() === this.email.toLowerCase());
    
    if (userIndex !== -1) {
      users[userIndex].password = this.newPassword;
      localStorage.setItem('registeredUsers', JSON.stringify(users));
      
      // Force AuthService to reload users from localStorage
      this.authService['loadUsersFromStorage']();
      
      console.log('═══════════════════════════════════════');
      console.log('✅ PASSWORD RESET SUCCESSFUL');
      console.log('═══════════════════════════════════════');
      console.log('Email:', this.email);
      console.log('New password has been set');
      console.log('═══════════════════════════════════════');
      
      this.successMessage = 'Password reset successful!';
      
      // Instant redirect to login
      setTimeout(() => {
        this.router.navigateByUrl('/login');
      }, 500);
    } else {
      this.errorMessage = 'User not found';
    }
  }

  // ==================== NAVIGATION ====================
  
  goToLogin() {
    this.router.navigate(['/login']);
  }

  goBackToRequest() {
    this.mode = 'request';
    this.enteredCode = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }
}