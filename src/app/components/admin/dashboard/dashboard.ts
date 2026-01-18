import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  stats: DashboardStats = {
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0
  };

  completionRate: number = 0;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
   
    this.stats.totalUsers = this.authService.getRegisteredUsersCount();

   
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    this.stats.totalOrders = orders.length;
    this.stats.pendingOrders = orders.filter((o: any) => o.status === 'pending').length;
    this.stats.completedOrders = orders.filter((o: any) => 
      o.status === 'delivered' || o.status === 'completed'
    ).length;

    
    this.stats.totalRevenue = orders.reduce((sum: number, order: any) => {
      if (order.items && Array.isArray(order.items)) {
        const orderTotal = order.items.reduce((itemSum: number, item: any) => {
          const price = parseFloat(item.price) || 0;
          const quantity = parseInt(item.quantity) || 1;
          return itemSum + (price * quantity);
        }, 0);
        return sum + orderTotal;
      }
     
      return sum + (parseFloat(order.total) || 0);
    }, 0);

   
    if (this.stats.totalOrders > 0) {
      this.completionRate = Math.round(
        (this.stats.completedOrders / this.stats.totalOrders) * 100
      );
    }

    console.log('📊 Dashboard Stats:', this.stats);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}