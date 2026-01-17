import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

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
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.loading = true;
    this.cdr.detectChanges();
    await this.loadProducts();
  }

  async loadProducts() {
    try {
      this.products = await this.supabaseService.getProducts();
      console.log('Products loaded:', this.products);
      
      
      this.products.forEach((product, index) => {
        console.log(`Product ${index + 1}:`, {
          name: product.name,
          image_url: product.image_url,
          fullPath: this.getFullImagePath(product.image_url)
        });
      });
      
    } catch (error) {
      console.error('Error loading products:', error);
      this.products = [];
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
      console.log('Loading state:', this.loading);
      console.log('Products count:', this.products.length);
    }
  }
  
  getFullImagePath(url: string): string {
    if (!url) return 'NO URL';
    if (url.startsWith('http')) return url;
    return window.location.origin + '/' + url;
  }
  
  onImageError(event: any, product: any) {
    console.error('❌ Image failed to load:', {
      product_name: product.name,
      attempted_url: event.target.src,
      original_url: product.image_url
    });
    event.target.src = 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image';
  }
  
  onImageLoad(event: any, product: any) {
    console.log('✅ Image loaded successfully:', {
      product_name: product.name,
      url: event.target.src
    });
  }
}