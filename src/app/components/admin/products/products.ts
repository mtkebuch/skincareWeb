import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  created_at?: Date;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.html',
  styleUrls: ['./products.css']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm: string = '';
  selectedCategory: string = 'all';
  
  showAddModal: boolean = false;
  showEditModal: boolean = false;
  showDeleteModal: boolean = false;
  
  currentProduct: Product = this.getEmptyProduct();
  productToDelete: Product | null = null;

  categories = ['Cream', 'Balm', 'Cleanse', 'Gel', 'Serum'];
  
  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.supabaseService.getProducts().subscribe({
      next: (data) => {
        this.products = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: parseFloat(p.price) || 0,
          category: p.category?.trim() || 'Serum',
          image_url: p.image_url || '',
          created_at: p.created_at ? new Date(p.created_at) : new Date()
        }));
        
        this.filterProducts();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading products:', error);
        this.errorMessage = error.message || 'Failed to load products';
        this.products = [];
        this.filteredProducts = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterProducts(): void {
    let filtered = [...this.products];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    }

    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }

    this.filteredProducts = filtered;
  }

  onSearch(): void {
    this.filterProducts();
  }

  onCategoryChange(): void {
    this.filterProducts();
  }

  openAddModal(): void {
    this.currentProduct = this.getEmptyProduct();
    this.showAddModal = true;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.errorMessage = '';
  }

  openEditModal(product: Product): void {
    this.currentProduct = { ...product };
    this.showEditModal = true;
    this.showAddModal = false;
    this.showDeleteModal = false;
    this.errorMessage = '';
  }

  openDeleteModal(product: Product): void {
    this.productToDelete = product;
    this.showDeleteModal = true;
    this.showAddModal = false;
    this.showEditModal = false;
    this.errorMessage = '';
  }

  closeModals(): void {
    this.showAddModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.currentProduct = this.getEmptyProduct();
    this.productToDelete = null;
    this.errorMessage = '';
  }

  validateProduct(): string | null {
    if (!this.currentProduct.name?.trim()) {
      return 'Product name is required';
    }
    if (this.currentProduct.price <= 0) {
      return 'Price must be greater than 0';
    }
    if (!this.currentProduct.category) {
      return 'Category is required';
    }
    return null;
  }

  saveProduct(): void {
    if (this.loading) return;

    const validationError = this.validateProduct();
    if (validationError) {
      this.errorMessage = validationError;
      return;
    }
    
    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    const productData = {
      name: this.currentProduct.name.trim(),
      description: this.currentProduct.description.trim(),
      price: this.currentProduct.price,
      category: this.currentProduct.category.trim(),
      image_url: this.currentProduct.image_url.trim()
    };

    console.log('🟦 Mode:', this.showAddModal ? 'ADD' : 'EDIT');
    console.log('🟦 Product ID:', this.currentProduct.id);
    console.log('🟦 Product Data:', productData);

    const operation = this.showAddModal 
      ? this.supabaseService.addProduct(productData)
      : this.supabaseService.updateProduct(this.currentProduct.id, productData);

    operation.subscribe({
      next: (result) => {
        console.log('🟦 Result:', result);
        
        if (!result) {
          throw new Error('Operation failed - no data returned from database');
        }
        
        this.loadProducts();
        this.closeModals();
      },
      error: (error: any) => {
        console.error('❌ Error saving product:', error);
        this.errorMessage = error.message || 'Failed to save product';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteProduct(): void {
    if (!this.productToDelete || this.loading) return;

    this.loading = true;
    this.errorMessage = '';

    this.supabaseService.deleteProduct(this.productToDelete.id).subscribe({
      next: (result) => {
        if (result === null || result === false) {
          throw new Error('Delete failed - check console for details');
        }
        
        this.loadProducts();
        this.closeModals();
      },
      error: (error: any) => {
        console.error('Error deleting product:', error);
        this.errorMessage = error.message || 'Failed to delete product';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getEmptyProduct(): Product {
    return {
      id: '',
      name: '',
      description: '',
      price: 0,
      category: 'Serum',
      image_url: ''
    };
  }

  getLowStockCount(): number {
    return this.products.filter(p => p.price < 10).length;
  }
}