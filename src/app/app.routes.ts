import { Routes } from '@angular/router';
import { HomepageComponent } from './components/homepage/homepage';
import { ProductDetailComponent } from './components/product-detail/product-detail';

export const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: '**', redirectTo: '' }
];