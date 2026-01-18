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

  newUsersThisMonth: number = 0;
  completionRate: number = 0;

  recentActivities = [
    {
      type: 'user',
      icon: '👤',
      text: 'New user registered: john@example.com',
      time: '2 hours ago'
    },
    {
      type: 'order',
      icon: '🛒',
      text: 'New order #12345 placed - $299.99',
      time: '3 hours ago'
    },
    {
      type: 'order',
      icon: '✅',
      text: 'Order #12344 completed and shipped',
      time: '5 hours ago'
    },
    {
      type: 'user',
      icon: '👤',
      text: 'New admin user added: admin@store.com',
      time: '1 day ago'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Users
    this.stats.totalUsers = this.authService.getRegisteredUsersCount();
    this.newUsersThisMonth = Math.floor(this.stats.totalUsers * 0.2);

    // Orders
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    this.stats.totalOrders = orders.length;
    this.stats.pendingOrders = orders.filter((o: any) => o.status === 'pending').length;
    this.stats.completedOrders = orders.filter((o: any) => 
      o.status === 'delivered' || o.status === 'completed'
    ).length;

    // Revenue
    this.stats.totalRevenue = orders.reduce((sum: number, order: any) => 
      sum + (order.total || 0), 0
    );

    // Completion Rate
    if (this.stats.totalOrders > 0) {
      this.completionRate = Math.round(
        (this.stats.completedOrders / this.stats.totalOrders) * 100
      );
    }
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}