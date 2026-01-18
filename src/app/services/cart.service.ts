import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  image_url?: string;  
  volume: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItems.asObservable();
  
  private cartOpenSubject = new BehaviorSubject<boolean>(false);
  public cartOpen$ = this.cartOpenSubject.asObservable();

  constructor() {
    this.loadCartFromStorage();
  }

  private loadCartFromStorage(): void {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      this.cartItems.next(JSON.parse(storedCart));
    }
  }

  private saveCartToStorage(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItems.value));
  }

  addToCart(product: Omit<CartItem, 'quantity'>): void {
    const currentItems = this.cartItems.value;
    const existingItem = currentItems.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
      this.cartItems.next([...currentItems]);
    } else {
      const newItem: CartItem = { ...product, quantity: 1 };
      this.cartItems.next([...currentItems, newItem]);
    }

    this.saveCartToStorage();
    
    
    this.openCart();
  }

  removeFromCart(productId: string): void {
    const currentItems = this.cartItems.value;
    this.cartItems.next(currentItems.filter(item => item.id !== productId));
    this.saveCartToStorage();
  }

  updateQuantity(productId: string, quantity: number): void {
    const currentItems = this.cartItems.value;
    const item = currentItems.find(item => item.id === productId);
    
    if (item) {
      item.quantity = quantity;
      this.cartItems.next([...currentItems]);
      this.saveCartToStorage();
    }
  }

  getCartItems(): CartItem[] {
    return this.cartItems.value;
  }

  getCartItemCount(): number {
    return this.cartItems.value.reduce((total, item) => total + item.quantity, 0);
  }

  getTotal(): number {
    return this.cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  clearCart(): void {
    this.cartItems.next([]);
    this.saveCartToStorage();
  }

  openCart(): void {
    this.cartOpenSubject.next(true);
  }

  closeCart(): void {
    this.cartOpenSubject.next(false);
  }
}