import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-confirmation.html',
  styleUrls: ['./order-confirmation.css']
})
export class OrderConfirmationComponent implements OnInit {
  order: any = null;
  orderId: string = '';
  userOrders: any[] = [];
  currentUser: any = null;
  isNewOrder: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Get order ID from query params
    this.route.queryParams.subscribe(params => {
      this.orderId = params['orderId'] || '';
      this.isNewOrder = params['new'] === 'true';
      
      if (this.orderId) {
        this.loadOrder();
      } else {
        // No order ID, show orders list
        this.loadUserOrders();
      }
    });
  }

  loadOrder(): void {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    this.order = orders.find((o: any) => o.orderId === this.orderId);

    if (!this.order) {
      this.router.navigate(['/order-confirmation']);
    }
  }

  loadUserOrders(): void {
    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    this.userOrders = allOrders
      .filter((order: any) => order.userId === this.currentUser.id)
      .sort((a: any, b: any) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }

  viewOrderDetails(orderId: string): void {
    this.router.navigate(['/order-confirmation'], { 
      queryParams: { orderId, new: 'false' } 
    });
  }

  backToOrders(): void {
    this.router.navigate(['/order-confirmation']);
  }

  continueShopping(): void {
    this.router.navigate(['/']);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  // ფოტოების URL-ების გასწორება
  getImageUrl(imageUrl: string): string {
    if (!imageUrl) {
      return 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image';
    }
    
    // თუ უკვე სრული Supabase URL-ია
    if (imageUrl.startsWith('https://ewqxmsfushdrbefoetbh.supabase.co')) {
      return imageUrl;
    }
    
    // თუ assets/-დან მოდის (ძველი შეკვეთები)
    if (imageUrl.includes('assets/')) {
      // ამოვიღოთ ფაილის სახელი
      const fileName = imageUrl.split('/').pop();
      // შევცვალოთ Supabase URL-ზე
      return `https://ewqxmsfushdrbefoetbh.supabase.co/storage/v1/object/public/product-images/${fileName}`;
    }
    
    // თუ უბრალოდ ფაილის სახელია
    if (!imageUrl.includes('/')) {
      return `https://ewqxmsfushdrbefoetbh.supabase.co/storage/v1/object/public/product-images/${imageUrl}`;
    }
    
    // default
    return imageUrl;
  }

  // ფოტოს ჩატვირთვის შეცდომა
  onImageError(event: any): void {
    console.error('❌ Order image failed to load:', event.target.src);
    event.target.src = 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image';
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: string): string {
    const statusMap: any = {
      'pending': 'status-pending',
      'processing': 'status-processing',
      'shipped': 'status-shipped',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled'
    };
    return statusMap[status] || 'status-pending';
  }
}