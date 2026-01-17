import { Routes } from '@angular/router';
import { HomepageComponent } from './components/homepage/homepage';
import { ProductDetailComponent } from './components/product-detail/product-detail';
import { AuthComponent } from './components/auth/auth';
import { RegisterComponent } from './components/register/register';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password';
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
    // არ უნდა იყოს guestGuard - რადგან token-ით reset-ზეც მოდის
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];