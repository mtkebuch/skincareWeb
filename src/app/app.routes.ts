import { Routes } from '@angular/router';
import { HomepageComponent } from './components/homepage/homepage';
import { ProductDetailComponent } from './components/product-detail/product-detail';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password';
import { CheckoutComponent } from './components/checkout/checkout';
import { OrderConfirmationComponent } from './components/orders/order-confirmation';
import { DashboardComponent } from './components/admin/dashboard/dashboard';
import { authGuard, guestGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  
  { 
    path: '', 
    component: HomepageComponent,
    title: 'Home | Skincare Shop'
  },
  { 
    path: 'shop', 
    component: HomepageComponent,
    title: 'Shop | Skincare Shop'
  },
  { 
    path: 'product/:id', 
    component: ProductDetailComponent,
    title: 'Product Details | Skincare Shop'
  },

  
  { 
    path: 'login',
    loadComponent: () => import('./components/auth/auth').then(m => m.AuthComponent),
    canActivate: [guestGuard],
    title: 'Login | Skincare Shop'
  },
  { 
    path: 'register',
    loadComponent: () => import('./components/register/register').then(m => m.RegisterComponent),
    canActivate: [guestGuard],
    title: 'Register | Skincare Shop'
  },
  { 
    path: 'forgot-password', 
    component: ForgotPasswordComponent,
    canActivate: [guestGuard],
    title: 'Reset Password | Skincare Shop'
  },

  
  { 
    path: 'checkout',  
    component: CheckoutComponent,
    canActivate: [authGuard],
    title: 'Checkout | Skincare Shop'
  },
  { 
    path: 'order-confirmation',
    component: OrderConfirmationComponent,
    canActivate: [authGuard],
    title: 'My Orders | Skincare Shop'
  },

  
  {
    path: 'admin',
    canActivate: [adminGuard],
    canActivateChild: [adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        title: 'Admin Dashboard | Skincare Shop'
      },
      {
        path: 'products',
        loadComponent: () => import('./components/admin/products/products').then(m => m.ProductsComponent),
        title: 'Manage Products | Skincare Shop'
      },
      {
        path: 'users',
        loadComponent: () => import('./components/admin/users/users').then(m => m.UsersComponent),
        title: 'Manage Users | Skincare Shop'
      }
    ]
  },

  
  { 
    path: '**', 
    loadComponent: () => import('./components/not-found/not-found').then(m => m.NotFoundComponent),
    title: '404 - Page Not Found | Skincare Shop'
  }
];