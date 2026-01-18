import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { CartSidebarComponent } from '../cart/cart-sidebar';
import { filter } from 'rxjs/operators';

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
    // Cart subscriptions
    this.cartService.cartItems$.subscribe(() => {
      this.cartItemCount = this.cartService.getCartItemCount();
    });

    this.cartService.cartOpen$.subscribe(isOpen => {
      this.isCartOpen = isOpen;
    });

    // Check for logout toast on navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkLogoutToast();
    });

    // Initial check
    this.checkLogoutToast();
  }

  private checkLogoutToast(): void {
    const justLoggedOut = sessionStorage.getItem('justLoggedOut');
    if (justLoggedOut === 'true') {
      sessionStorage.removeItem('justLoggedOut');
      
      // Small delay to ensure page is rendered
      setTimeout(() => {
        this.showLogoutToast = true;
        this.cdr.detectChanges();
        
        // Hide after 3 seconds
        setTimeout(() => {
          this.showLogoutToast = false;
          this.cdr.detectChanges();
        }, 3000);
      }, 100);
    }
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
      this.router.navigate(['/order-confirmation']);
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
    
    // Set flag for toast
    sessionStorage.setItem('justLoggedOut', 'true');
    
    // Navigate to homepage
    this.router.navigate(['/']);
  }

  cancelLogout(): void {
    this.showLogoutModal = false;
  }
}