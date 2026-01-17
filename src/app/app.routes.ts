import { Routes } from '@angular/router';
import { HomepageComponent } from './components/homepage/homepage';

export const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: '**', redirectTo: '' }
];