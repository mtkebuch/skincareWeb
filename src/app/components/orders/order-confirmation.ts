import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.route.queryParams.subscribe(params => {
      this.orderId = params['orderId'] || '';
      this.isNewOrder = params['new'] === 'true';
      
      setTimeout(() => {
        if (this.orderId) {
          this.loadOrder();
        } else {
          this.loadUserOrders();
        }
        this.cdr.detectChanges();
      }, 0);
    });
  }

  loadOrder(): void {
    try {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      this.order = orders.find((o: any) => o.orderId === this.orderId || o.id === this.orderId);

      if (!this.order) {
        console.warn('⚠️ Order not found');
        this.router.navigate(['/order-confirmation']);
      } else {
        console.log('✅ Order loaded:', this.order);
      }
    } catch (error) {
      console.error('❌ Error loading order:', error);
      this.router.navigate(['/order-confirmation']);
    }
  }

  loadUserOrders(): void {
    try {
      const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      this.userOrders = allOrders
        .filter((order: any) => order.userId === this.currentUser.id)
        .sort((a: any, b: any) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
      
      console.log('✅ User orders:', this.userOrders);
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      this.userOrders = [];
    }
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

  
  getItemName(item: any): string {
    return item?.productName || item?.name || 'Unknown Product';
  }

  
  getTotalAmount(order: any): number {
    return order?.totalAmount || order?.total || 0;
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