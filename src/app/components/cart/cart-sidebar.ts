import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; 
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-sidebar.html',
  styleUrls: ['./cart-sidebar.css']
})
export class CartSidebarComponent {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  constructor(
    public cartService: CartService,
    private router: Router 
  ) {}

  onClose(): void {
    this.close.emit();
  }

  onOverlayClick(): void {
    this.onClose();
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity > 0 && newQuantity <= 999) {
      this.cartService.updateQuantity(item.id, newQuantity);
    } else if (newQuantity > 999) {
      this.cartService.updateQuantity(item.id, 999);
    } else if (newQuantity < 1) {
      this.cartService.updateQuantity(item.id, 1);
    }
  }

  increaseQuantity(item: CartItem): void {
    if (item.quantity < 999) {
      this.cartService.updateQuantity(item.id, item.quantity + 1);
    }
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.id, item.quantity - 1);
    }
  }

  removeItem(itemId: string): void {
    this.cartService.removeFromCart(itemId);
  }

  getTotal(): number {
    return this.cartService.getTotal();
  }

  getCartItems(): CartItem[] {
    return this.cartService.getCartItems();
  }

  getCartItemCount(): number {
    return this.cartService.getCartItemCount();
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']); 
    this.onClose();
  }
}