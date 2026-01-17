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
  }

  async getProducts() {
    try {
      const { data, error } = await this.supabase
        .from('skincare_products')
        .select('*');

      if (error) {
        console.error('Error fetching products:', error);
        return [];
      }

      
      const fixedData = (data || []).map(product => ({
        ...product,
        image_url: product.image_url?.startsWith('/') 
          ? product.image_url.substring(1) 
          : product.image_url
      }));

      console.log('Products with fixed image paths:', fixedData);
      return fixedData;
    } catch (err) {
      console.error('Exception in getProducts:', err);
      return [];
    }
  }

  async addProduct(product: any) {
    const { data, error } = await this.supabase
      .from('skincare_products')
      .insert([product])
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
      .update(product)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating product:', error);
      return null;
    }
    return data;
  }
}