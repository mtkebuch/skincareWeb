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

  async ngOnInit() {
    await this.loadProducts();

    // გვერდის რეფრეშისას ხელახლა ჩატვირთვა
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

  async loadProducts() {
    try {
      this.loading = true;
      this.cdr.detectChanges();

      console.log('📦 Fetching products...');
      this.products = await this.supabaseService.getProducts();
      this.filteredProducts = this.products;
      console.log(`✅ Products loaded: ${this.products.length}`);
      
      // დეტალური ლოგირება (დეველოპმენტისთვის)
      this.products.forEach((product, index) => {
        console.log(`Product ${index + 1}:`, {
          name: product.name,
          image_url: product.image_url,
          category: product.category
        });
      });
      
    } catch (error) {
      console.error('❌ Error loading products:', error);
      this.products = [];
      this.filteredProducts = [];
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
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

  async refreshProducts() {
    console.log('🔄 Manual refresh triggered');
    await this.loadProducts();
  }
  
  // ფოტოს URL - უბრალოდ დაბრუნება (database-ში უკვე სწორი Supabase URL-ია)
  getFullImagePath(url: string): string {
    if (!url) {
      return 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image';
    }
    // URL უკვე სწორია database-ში
    return url;
  }
  
  // ფოტოს ჩატვირთვის შეცდომა
  onImageError(event: any, product: any) {
    console.error('❌ Image failed to load:', {
      product: product.name,
      url: product.image_url
    });
    event.target.src = 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image';
  }
  
  // ფოტოს წარმატებით ჩატვირთვა
  onImageLoad(event: any, product: any) {
    console.log('✅ Image loaded:', product.name);
  }
}