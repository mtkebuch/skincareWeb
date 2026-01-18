import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { AuthService, User } from '../../services/auth.service';

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css']
})
export class CheckoutComponent implements OnInit {
  currentUser: User | null = null;
  cartItems: CartItem[] = [];
  
  shippingAddress: ShippingAddress = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Georgia'
  };

  paymentMethod: 'card' | 'cash' = 'card';
  
  cardDetails = {
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  };

  agreedToTerms: boolean = false;
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  errors: any = {};

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.cartItems = this.cartService.getCartItems();
    
    if (this.cartItems.length === 0) {
      this.router.navigate(['/']);
      return;
    }

    this.shippingAddress.firstName = this.currentUser.firstName;
    this.shippingAddress.lastName = this.currentUser.lastName;
    this.shippingAddress.email = this.currentUser.email;
    
    console.log('🛒 Cart items at checkout:', this.cartItems);
  }

  getSubtotal(): number {
    return this.cartService.getTotal();
  }

  getShippingCost(): number {
    return this.getSubtotal() >= 100 ? 0 : 10;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getShippingCost();
  }

  validateShippingAddress(): boolean {
    this.errors = {};
    let isValid = true;

    if (!this.shippingAddress.firstName.trim()) {
      this.errors.firstName = 'First name is required';
      isValid = false;
    }

    if (!this.shippingAddress.lastName.trim()) {
      this.errors.lastName = 'Last name is required';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.shippingAddress.email)) {
      this.errors.email = 'Valid email is required';
      isValid = false;
    }

    const phoneRegex = /^[0-9]{9,15}$/;
    if (!phoneRegex.test(this.shippingAddress.phone.replace(/[\s\-\(\)]/g, ''))) {
      this.errors.phone = 'Valid phone number is required';
      isValid = false;
    }

    if (!this.shippingAddress.address.trim()) {
      this.errors.address = 'Address is required';
      isValid = false;
    }

    if (!this.shippingAddress.city.trim()) {
      this.errors.city = 'City is required';
      isValid = false;
    }

    if (!this.shippingAddress.postalCode.trim()) {
      this.errors.postalCode = 'Postal code is required';
      isValid = false;
    }

    return isValid;
  }

  validateCardDetails(): boolean {
    if (this.paymentMethod !== 'card') {
      return true;
    }

    let isValid = true;

    const cardNumber = this.cardDetails.cardNumber.replace(/\s/g, '');
    if (!/^[0-9]{16}$/.test(cardNumber)) {
      this.errors.cardNumber = 'Valid 16-digit card number is required';
      isValid = false;
    }

    if (!this.cardDetails.cardName.trim()) {
      this.errors.cardName = 'Cardholder name is required';
      isValid = false;
    }

    if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(this.cardDetails.expiryDate)) {
      this.errors.expiryDate = 'Valid expiry date is required (MM/YY)';
      isValid = false;
    }

    if (!/^[0-9]{3,4}$/.test(this.cardDetails.cvv)) {
      this.errors.cvv = 'Valid CVV is required';
      isValid = false;
    }

    return isValid;
  }

  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    this.cardDetails.cardNumber = formattedValue;
  }

  formatExpiryDate(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.cardDetails.expiryDate = value;
  }

  async placeOrder(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.validateShippingAddress()) {
      this.errorMessage = 'Please fill in all required shipping information';
      return;
    }

    if (!this.validateCardDetails()) {
      this.errorMessage = 'Please fill in all required payment information';
      return;
    }

    if (!this.agreedToTerms) {
      this.errorMessage = 'Please agree to the terms and conditions';
      return;
    }

    this.loading = true;

    setTimeout(() => {
      const orderId = 'ORD-' + Date.now();
      const orderDate = new Date();
      
     
      const items = this.cartItems.map(item => {
        const cartItemAny = item as any;
        const imageUrl = cartItemAny.image_url || cartItemAny.image || `${item.id}.webp`;
        
        console.log(`📸 Preparing item "${item.name}":`, {
          id: item.id,
          image_url: imageUrl,
          hasImageUrl: !!cartItemAny.image_url,
          hasImage: !!cartItemAny.image
        });
        
        return {
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
          image_url: imageUrl,
          image: imageUrl  
        };
      });
      
      const order = {
        orderId: orderId,
        userId: this.currentUser?.id,
        customerName: `${this.shippingAddress.firstName} ${this.shippingAddress.lastName}`,
        customerEmail: this.shippingAddress.email,
        orderDate: orderDate,
        status: 'pending',
        totalAmount: this.getTotal(),
        items: items,
        shippingAddress: {
          fullName: `${this.shippingAddress.firstName} ${this.shippingAddress.lastName}`,
          firstName: this.shippingAddress.firstName,
          lastName: this.shippingAddress.lastName,
          email: this.shippingAddress.email,
          phone: this.shippingAddress.phone,
          address: this.shippingAddress.address,
          city: this.shippingAddress.city,
          postalCode: this.shippingAddress.postalCode,
          country: this.shippingAddress.country
        },
        paymentMethod: this.paymentMethod
      };

      console.log('📦 Saving order:', order);
      console.log('📦 Order items with images:', order.items);

      this.saveOrder(order);
      this.cartService.clearCart();

      this.loading = false;
      this.successMessage = 'Order placed successfully!';

      setTimeout(() => {
        this.router.navigate(['/order-confirmation'], { 
          queryParams: { orderId: order.orderId, new: 'true' }
        });
      }, 1500);
    }, 2000);
  }

  private saveOrder(order: any): void {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    console.log('✅ Order saved to localStorage:', order);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}