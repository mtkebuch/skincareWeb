import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router, NavigationEnd } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.css']
})
export class ProductDetailComponent implements OnInit {
  product: any = null;
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Load product on init
    this.loadCurrentProduct();

    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.loadCurrentProduct();
    });
  }

  async loadCurrentProduct() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('Loading product ID:', id);

    if (!id) {
      this.error = 'No product ID';
      this.loading = false;
      return;
    }

    // Reset state
    this.product = null;
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges(); // Force update

    try {
      this.product = await this.supabaseService.getProductById(id);
      
      if (!this.product) {
        this.error = 'Product not found';
      } else {
        console.log('Product loaded:', this.product.name);
      }
    } catch (err) {
      console.error('Error:', err);
      this.error = 'Error loading product';
    } finally {
      this.loading = false;
      this.cdr.detectChanges(); // Force update
    }
  }
}