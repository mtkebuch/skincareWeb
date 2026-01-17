// header.component.ts
import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { CartSidebarComponent } from '../cart/cart-sidebar';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, CartSidebarComponent],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit {
  showLogoutToast: boolean = false;
  showLogoutModal: boolean = false;
  isCartOpen: boolean = false;
  cartItemCount: number = 0;

  constructor(
    private authService: AuthService,
    public cartService: CartService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Check if there's a logout flag in sessionStorage
    const justLoggedOut = sessionStorage.getItem('justLoggedOut');
    if (justLoggedOut === 'true') {
      sessionStorage.removeItem('justLoggedOut');
      this.showLogoutToast = true;
      this.cdr.detectChanges();
      
      setTimeout(() => {
        this.showLogoutToast = false;
        this.cdr.detectChanges();
      }, 3000);
    }

    // Subscribe to cart changes
    this.cartService.cartItems$.subscribe(() => {
      this.cartItemCount = this.cartService.getCartItemCount();
    });

    // Subscribe to cart open/close
    this.cartService.cartOpen$.subscribe(isOpen => {
      this.isCartOpen = isOpen;
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  getUserName(): string {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      return `${currentUser.firstName} ${currentUser.lastName}`;
    }
    return 'User';
  }

  handleUserClick(): void {
    if (this.isLoggedIn()) {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  toggleCart(): void {
    this.cartService.openCart();
  }

  closeCart(): void {
    this.cartService.closeCart();
  }

  logout(): void {
    this.showLogoutModal = true;
  }

  confirmLogout(): void {
    this.showLogoutModal = false;
    this.authService.logout();
    
    // Set flag in sessionStorage
    sessionStorage.setItem('justLoggedOut', 'true');
    
    // Navigate to home page
    this.router.navigate(['/']).then(() => {
      // After navigation, show toast
      setTimeout(() => {
        this.showLogoutToast = true;
        this.cdr.detectChanges();
        
        setTimeout(() => {
          this.showLogoutToast = false;
          this.cdr.detectChanges();
        }, 3000);
      }, 100);
    });
  }

  cancelLogout(): void {
    this.showLogoutModal = false;
  }
}