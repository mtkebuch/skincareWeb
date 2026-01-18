import { Routes } from '@angular/router';
import { HomepageComponent } from './components/homepage/homepage';
import { ProductDetailComponent } from './components/product-detail/product-detail';
import { AuthComponent } from './components/auth/auth';
import { RegisterComponent } from './components/register/register';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password';
import { CheckoutComponent } from './components/checkout/checkout';
import { OrderConfirmationComponent } from './components/orders/order-confirmation'; 
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    component: HomepageComponent 
  },
  { 
    path: 'product/:id', 
    component: ProductDetailComponent 
  },
  { 
    path: 'login', 
    component: AuthComponent,
    canActivate: [guestGuard]
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    canActivate: [guestGuard]
  },
  { 
    path: 'forgot-password', 
    component: ForgotPasswordComponent
  },
  { 
    path: 'checkout',  
    component: CheckoutComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'order-confirmation',  // ⬅️ დაამატეთ
    component: OrderConfirmationComponent,
    canActivate: [authGuard]
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];