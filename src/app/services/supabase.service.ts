import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://ewqxmsfushdrbefoetbh.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3cXhtc2Z1c2hkcmJlZm9ldGJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NDIzOTEsImV4cCI6MjA4NDIxODM5MX0.qumZgRm2w311npGQ_jdeRYW-yxs8sUVWWOLqXyfMXpo'
    );
    console.log('Supabase client initialized');
  }

  async getProducts() {
    try {
      console.log('Fetching all products...');
      
      const { data, error } = await this.supabase
        .from('skincare_products')
        .select('*');

      if (error) {
        console.error('Error fetching products:', error);
        return [];
      }

      if (!data || data.length === 0) {
        console.warn('No products found');
        return [];
      }

      console.log('Products fetched:', data.length);
      
      // ვასუფთავებთ მონაცემებს
      const fixedData = data.map(product => ({
        ...product,
        image_url: product.image_url?.startsWith('/') 
          ? product.image_url.substring(1) 
          : product.image_url,
        // ᲛᲜᲘᲨᲕᲜᲔᲚᲝᲕᲐᲜᲘ: ვასუფთავებთ category-ს ზედმეტი სივრცეებისგან
        category: product.category?.trim()
      }));

      // დიაგნოსტიკა
      console.log('Categories found:', [...new Set(fixedData.map(p => p.category))]);

      return fixedData;
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
        if (data.image_url?.startsWith('/')) {
          data.image_url = data.image_url.substring(1);
        }
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
    return data;
  }

  async deleteProduct(id: string) {
    const { data, error } = await this.supabase
      .from('skincare_products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      return null;
    }
    return data;
  }

  async updateProduct(id: string, product: any) {
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
    return data;
  }
}