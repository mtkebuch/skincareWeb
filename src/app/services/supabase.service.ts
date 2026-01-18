import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private STORAGE_BUCKET = 'product-images';

  constructor() {
    this.supabase = createClient(
      'https://ewqxmsfushdrbefoetbh.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3cXhtc2Z1c2hkcmJlZm9ldGJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NDIzOTEsImV4cCI6MjA4NDIxODM5MX0.qumZgRm2w311npGQ_jdeRYW-yxs8sUVWWOLqXyfMXpo'
    );
    console.log('Supabase client initialized');
  }

  
  uploadProductImage(file: File): Observable<string | null> {
    return from(
      (async () => {
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = fileName;

          console.log('Uploading image:', fileName);

          const { error: uploadError } = await this.supabase.storage
            .from(this.STORAGE_BUCKET)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            return null;
          }

          const { data } = this.supabase.storage
            .from(this.STORAGE_BUCKET)
            .getPublicUrl(filePath);

          console.log('✅ Image uploaded successfully:', data.publicUrl);
          return data.publicUrl;
        } catch (err) {
          console.error('Exception in uploadProductImage:', err);
          return null;
        }
      })()
    );
  }

  deleteProductImage(imageUrl: string): Observable<boolean> {
    return from(
      (async () => {
        try {
          if (!imageUrl || !imageUrl.includes('supabase.co/storage')) {
            return false;
          }

          const fileName = imageUrl.split('/').pop();
          
          if (!fileName) {
            return false;
          }

          const { error } = await this.supabase.storage
            .from(this.STORAGE_BUCKET)
            .remove([fileName]);

          if (error) {
            console.error('Error deleting image:', error);
            return false;
          }

          console.log('✅ Image deleted:', fileName);
          return true;
        } catch (err) {
          console.error('Exception in deleteProductImage:', err);
          return false;
        }
      })()
    );
  }

  getProducts(): Observable<any[]> {
    return from(
      this.supabase
        .from('skincare_products')
        .select('*')
    ).pipe(
      map(response => {
        if (response.error) {
          console.error('Error fetching products:', response.error);
          return [];
        }

        if (!response.data || response.data.length === 0) {
          console.warn('No products found');
          return [];
        }

        console.log('✅ Products fetched:', response.data.length);
        
        return response.data.map(product => ({
          ...product,
          category: product.category?.trim(),
        }));
      }),
      catchError(error => {
        console.error('Exception in getProducts:', error);
        return of([]);
      })
    );
  }

  getProductById(id: string): Observable<any | null> {
    return from(
      this.supabase
        .from('skincare_products')
        .select('*')
        .eq('id', id)
        .single()
    ).pipe(
      map(response => {
        if (response.error) {
          console.error('Error fetching product:', response.error);
          return null;
        }

        if (response.data) {
          response.data.category = response.data.category?.trim();
          console.log('Product found:', response.data.name);
          return response.data;
        }

        return null;
      }),
      catchError(error => {
        console.error('Exception in getProductById:', error);
        return of(null);
      })
    );
  }

  addProduct(product: any): Observable<any | null> {
    const cleanProduct = {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category?.trim(),
      image_url: product.image_url
    };

    console.log('➕ Inserting:', cleanProduct);

    return from(
      this.supabase
        .from('skincare_products')
        .insert([cleanProduct])
        .select()
    ).pipe(
      map(response => {
        if (response.error) {
          console.error('❌ Add error:', response.error);
          return null;
        }
        
        console.log('✅ Product added:', response.data);
        return response.data && response.data.length > 0 ? response.data[0] : response.data;
      }),
      catchError(error => {
        console.error('Exception in addProduct:', error);
        return of(null);
      })
    );
  }

  updateProduct(id: string, product: any): Observable<any | null> {
    const cleanProduct = {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category?.trim(),
      image_url: product.image_url
    };

    console.log('✏️ Updating ID:', id);
    console.log('✏️ Data:', cleanProduct);

    return from(
      this.supabase
        .from('skincare_products')
        .update(cleanProduct)
        .eq('id', id)
        .select()
    ).pipe(
      map(response => {
        if (response.error) {
          console.error('❌ Update error:', response.error);
          return null;
        }
        
        console.log('✅ Product updated:', response.data);
        return response.data && response.data.length > 0 ? response.data[0] : response.data;
      }),
      catchError(error => {
        console.error('Exception in updateProduct:', error);
        return of(null);
      })
    );
  }

  deleteProduct(id: string): Observable<boolean> {
    return from(
      (async () => {
        try {
          const productResponse = await this.supabase
            .from('skincare_products')
            .select('*')
            .eq('id', id)
            .single();
          
          const product = productResponse.data;
          
          if (product?.image_url && product.image_url.includes('supabase.co/storage')) {
            const fileName = product.image_url.split('/').pop();
            if (fileName) {
              await this.supabase.storage
                .from(this.STORAGE_BUCKET)
                .remove([fileName]);
            }
          }

          const { error } = await this.supabase
            .from('skincare_products')
            .delete()
            .eq('id', id);

          if (error) {
            console.error('Error deleting product:', error);
            return false;
          }
          
          console.log('✅ Product deleted successfully');
          return true;
        } catch (err) {
          console.error('Exception in deleteProduct:', err);
          return false;
        }
      })()
    );
  }

  
  getUsers(): Observable<any[]> {
    return from(
      this.supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
    ).pipe(
      map(response => {
        if (response.error) {
          console.error('Error fetching users:', response.error);
          return [];
        }

        console.log('Users fetched:', response.data?.length || 0);
        return response.data || [];
      }),
      catchError(error => {
        console.error('Exception in getUsers:', error);
        return of([]);
      })
    );
  }

  updateUser(id: string, user: any): Observable<any | null> {
    return from(
      this.supabase
        .from('users')
        .update(user)
        .eq('id', id)
        .select()
    ).pipe(
      map(response => {
        if (response.error) {
          console.error('Error updating user:', response.error);
          return null;
        }
        
        console.log('✅ User updated successfully:', response.data);
        return response.data && response.data.length > 0 ? response.data[0] : response.data;
      }),
      catchError(error => {
        console.error('Exception in updateUser:', error);
        return of(null);
      })
    );
  }

  deleteUser(id: string): Observable<boolean> {
    return from(
      this.supabase
        .from('users')
        .delete()
        .eq('id', id)
    ).pipe(
      map(response => {
        if (response.error) {
          console.error('Error deleting user:', response.error);
          return false;
        }
        
        console.log('✅ User deleted successfully');
        return true;
      }),
      catchError(error => {
        console.error('Exception in deleteUser:', error);
        return of(false);
      })
    );
  }
}