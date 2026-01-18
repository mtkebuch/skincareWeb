import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
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
  filteredProducts: any[] = [];
  loading = false;
  selectedCategory: string = 'all';

  constructor(
    private supabaseService: SupabaseService,
    private cartService: CartService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProducts();

    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (event.url === '/' || event.url === '') {
        console.log('Navigated to homepage, reloading products...');
        this.loadProducts();
      }
    });
  }

  scrollToTop(): void {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 0);
  }

  loadProducts() {
    this.loading = true;
    this.cdr.detectChanges();

    console.log('📦 Fetching products...');
    
    this.supabaseService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = this.products;
        console.log(`✅ Products loaded: ${this.products.length}`);
        
        
        this.products.forEach((product, index) => {
          console.log(`Product ${index + 1}:`, {
            name: product.name,
            image_url: product.image_url,
            category: product.category
          });
        });
        
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error loading products:', error);
        this.products = [];
        this.filteredProducts = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    
    if (category === 'all') {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(product => {
        const productCategory = product.category?.trim().toLowerCase();
        const filterCategory = category.trim().toLowerCase();
        return productCategory === filterCategory;
      });
    }
    
    console.log(`🔍 Filtered by "${category}": ${this.filteredProducts.length} products`);
    this.cdr.detectChanges();
  }

  refreshProducts() {
    console.log('🔄 Manual refresh triggered');
    this.loadProducts();
  }
  
  
  getFullImagePath(url: string): string {
    if (!url) {
      return 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image';
    }
    
    return url;
  }
  
  
  onImageError(event: any, product: any) {
    console.error('❌ Image failed to load:', {
      product: product.name,
      url: product.image_url
    });
    event.target.src = 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image';
  }
  
 
  onImageLoad(event: any, product: any) {
    console.log('✅ Image loaded:', product.name);
  }
}