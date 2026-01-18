import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

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

  // ფოტოს ატვირთვა Supabase Storage-ში
  async uploadProductImage(file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      // პირდაპირ root-ში ატვირთვა (products/ subfolder-ის გარეშე)
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

      // მივიღოთ public URL
      const { data } = this.supabase.storage
        .from(this.STORAGE_BUCKET)
        .getPublicUrl(filePath);

      console.log('✅ Image uploaded successfully:', data.publicUrl);
      return data.publicUrl;
    } catch (err) {
      console.error('Exception in uploadProductImage:', err);
      return null;
    }
  }

  // ფოტოს წაშლა Storage-დან
  async deleteProductImage(imageUrl: string): Promise<boolean> {
    try {
      if (!imageUrl || !imageUrl.includes('supabase.co/storage')) {
        return false;
      }

      // URL-დან fileName-ის გამოტანა
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
  }

  async getProducts() {
    try {
      console.log('Fetching all products...');
      
      const { data, error } = await this.supabase
        .from('skincare_products')
        .select('*');

      if (error) {
        console.error('Error fetching products:', error);
        console.error('Error details:', JSON.stringify(error));
        return [];
      }

      if (!data || data.length === 0) {
        console.warn('No products found');
        return [];
      }

      console.log('Products fetched:', data.length);
      
      // მონაცემების დამუშავება
      const processedData = data.map(product => ({
        ...product,
        category: product.category?.trim(),
      }));

      console.log('Categories found:', [...new Set(processedData.map(p => p.category))]);

      return processedData;
    } catch (err) {
      console.error('Exception in getProducts:', err);
      return [];
    }
  }

  async getProductById(id: string) {
    try {
      console.log('Fetching product with ID:', id);
      
      const { data, error } = await this.supabase
        .from('skincare_products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        return null;
      }

      if (data) {
        data.category = data.category?.trim();
        console.log('Product found:', data.name);
        return data;
      }

      console.log('No product found');
      return null;
    } catch (err) {
      console.error('Exception in getProductById:', err);
      return null;
    }
  }

  async addProduct(product: any) {
    try {
      const { data, error } = await this.supabase
        .from('skincare_products')
        .insert([{
          ...product,
          category: product.category?.trim()
        }])
        .select();

      if (error) {
        console.error('Error adding product:', error);
        return null;
      }
      
      console.log('✅ Product added successfully:', data);
      return data;
    } catch (err) {
      console.error('Exception in addProduct:', err);
      return null;
    }
  }

  async updateProduct(id: string, product: any) {
    try {
      const { data, error } = await this.supabase
        .from('skincare_products')
        .update({
          ...product,
          category: product.category?.trim()
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error updating product:', error);
        return null;
      }
      
      console.log('✅ Product updated successfully:', data);
      return data;
    } catch (err) {
      console.error('Exception in updateProduct:', err);
      return null;
    }
  }

  async deleteProduct(id: string) {
    try {
      // ჯერ ვიღებთ პროდუქტს რომ ფოტო წავშალოთ
      const product = await this.getProductById(id);
      
      // თუ ფოტო Supabase Storage-დანაა, წავშალოთ
      if (product?.image_url && product.image_url.includes('supabase.co/storage')) {
        await this.deleteProductImage(product.image_url);
      }

      // პროდუქტის წაშლა
      const { data, error } = await this.supabase
        .from('skincare_products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        return null;
      }
      
      console.log('✅ Product deleted successfully');
      return data;
    } catch (err) {
      console.error('Exception in deleteProduct:', err);
      return null;
    }
  }
}