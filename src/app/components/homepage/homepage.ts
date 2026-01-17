import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './homepage.html',
  styleUrls: ['./homepage.css']
})
export class HomepageComponent implements OnInit {
  products: any[] = [];
  loading = false;

  constructor(
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  async ngOnInit() {
    // Load products initially
    await this.loadProducts();

    // Reload products when navigating back to homepage
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Check if we're on the homepage
      if (event.url === '/' || event.url === '') {
        console.log('Navigated to homepage, reloading products...');
        this.loadProducts();
      }
    });
  }

  async loadProducts() {
    try {
      this.loading = true;
      this.cdr.detectChanges();

      console.log('Fetching products...');
      this.products = await this.supabaseService.getProducts();
      console.log('Products loaded:', this.products.length);
      
      this.products.forEach((product, index) => {
        console.log(`Product ${index + 1}:`, {
          name: product.name,
          image_url: product.image_url
        });
      });
      
    } catch (error) {
      console.error('Error loading products:', error);
      this.products = [];
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
      console.log('Loading complete. Products count:', this.products.length);
    }
  }

  // Manual refresh method
  async refreshProducts() {
    console.log('Manual refresh triggered');
    await this.loadProducts();
  }
  
  getFullImagePath(url: string): string {
    if (!url) return 'NO URL';
    if (url.startsWith('http')) return url;
    return window.location.origin + '/' + url;
  }
  
  onImageError(event: any, product: any) {
    console.error('Image failed to load:', {
      product_name: product.name,
      attempted_url: event.target.src,
      original_url: product.image_url
    });
    event.target.src = 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image';
  }
  
  onImageLoad(event: any, product: any) {
    console.log('Image loaded successfully:', {
      product_name: product.name,
      url: event.target.src
    });
  }
}