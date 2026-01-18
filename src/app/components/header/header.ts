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
  isAdminRoute: boolean = false;

  constructor(
    private authService: AuthService,
    public cartService: CartService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    
    this.cartService.cartItems$.subscribe(() => {
      this.cartItemCount = this.cartService.getCartItemCount();
    });

    this.cartService.cartOpen$.subscribe(isOpen => {
      this.isCartOpen = isOpen;
    });

    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isAdminRoute = event.url.startsWith('/admin');
      this.checkLogoutToast();
      this.cdr.detectChanges();
    });

    
    this.isAdminRoute = this.router.url.startsWith('/admin');
    this.checkLogoutToast();
  }

  private checkLogoutToast(): void {
    const justLoggedOut = sessionStorage.getItem('justLoggedOut');
    if (justLoggedOut === 'true') {
      sessionStorage.removeItem('justLoggedOut');
      setTimeout(() => {
        this.showLogoutToast = true;
        this.cdr.detectChanges();
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
    
    
    this.cartService.clearCart();
    
    this.authService.logout();
    sessionStorage.setItem('justLoggedOut', 'true');
    
    
    this.router.navigate(['/shop']);
  }

  cancelLogout(): void {
    this.showLogoutModal = false;
  }

  handleScannerClick(): void {
   
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.role === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      
      console.log('Access denied: Admin only');
    }
  }
}