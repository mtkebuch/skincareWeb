import { Component, OnInit, ChangeDetectorRef, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule, Router, NavigationStart } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.css']
})
export class ProductDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  product: any = null;
  suggestedProducts: any[] = [];
  loading: boolean = true;
  loadingSuggestions: boolean = true;
  error: string | null = null;
  private routeSubscription?: Subscription;
  private navigationSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private supabaseService: SupabaseService,
    private authService: AuthService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {
    this.forceScrollToTop();
    
    this.navigationSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationStart)
    ).subscribe(() => {
      this.forceScrollToTop();
    });
  }

  private forceScrollToTop(): void {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 0);
  }

  ngOnInit() {
    this.forceScrollToTop();
    this.loadCurrentProduct();
    
    this.routeSubscription = this.route.params.subscribe(() => {
      this.forceScrollToTop();
      this.loadCurrentProduct();
    });
  }

  ngAfterViewInit() {
    this.forceScrollToTop();
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  async loadCurrentProduct() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('Loading product ID:', id);

    if (!id) {
      this.error = 'No product ID';
      this.loading = false;
      this.loadingSuggestions = false;
      return;
    }

    this.product = null;
    this.suggestedProducts = [];
    this.loading = true;
    this.loadingSuggestions = true;
    this.error = null;
    this.cdr.detectChanges();

    try {
      // პირველ რიგში ვტვირთავთ ყველა პროდუქტს პარალელურად
      const [currentProduct, allProducts] = await Promise.all([
        this.supabaseService.getProductById(id),
        this.supabaseService.getProducts()
      ]);
      
      if (!currentProduct) {
        this.error = 'Product not found';
        this.loading = false;
        this.loadingSuggestions = false;
        this.cdr.detectChanges();
        return;
      }

      this.product = currentProduct;
      console.log('Product loaded:', this.product.name);
      
      // ვფილტრავთ და ვქმნით suggested products-ს
      const filtered = allProducts.filter(p => p.id !== id);
      this.suggestedProducts = this.shuffleArray(filtered).slice(0, 4);
      console.log('Suggested products loaded:', this.suggestedProducts.length);
      
      this.loading = false;
      this.loadingSuggestions = false;
      this.cdr.detectChanges();
      
    } catch (err) {
      console.error('Error:', err);
      this.error = 'Error loading product';
      this.loading = false;
      this.loadingSuggestions = false;
      this.cdr.detectChanges();
    }
  }

  private shuffleArray(array: any[]): any[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  navigateToProduct(productId: string): void {
    this.forceScrollToTop();
    this.router.navigate(['/product', productId]);
  }

  addToCart(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    const isAuth = this.authService.isAuthenticated();
    
    console.log('=== ADD TO CART CLICKED ===');
    console.log('Auth status:', isAuth);
    console.log('Product:', this.product?.name);
    
    if (!isAuth) {
      console.log('User not authenticated, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }
    
    if (!this.product) {
      console.error('No product to add');
      return;
    }
    
    this.cartService.addToCart({
      id: this.product.id,
      name: this.product.name,
      price: this.product.price,
      image: this.product.image_url || 'https://placehold.co/300x400/f5f5f0/999?text=Product',
      volume: this.product.category || '75 ml'
    });
    
    console.log('Product added to cart successfully');
  }

  goBack(): void {
    this.location.back();
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}