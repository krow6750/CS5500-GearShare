import { NextResponse } from 'next/server';
import { booqableService } from '@/lib/booqable/booqableService';

export async function POST() {
  try {
    // First, enable variations on all groups
    const groups = await booqableService.makeRequest('/product_groups', 'GET');
    for (const group of groups.product_groups) {
      await booqableService.makeRequest(`/product_groups/${group.id}`, 'PUT', {
        product_group: {
          has_variations: true,
          variation_fields: ['name']
        }
      });
    }

    // Now archive all products instead of deleting
    const products = await booqableService.makeRequest('/products', 'GET');
    for (const product of products.products) {
      await booqableService.makeRequest(`/products/${product.id}`, 'PUT', {
        product: {
          archived: true
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'All products archived and groups updated',
      groupsUpdated: groups.product_groups.length,
      productsArchived: products.products.length
    });
  } catch (error) {
    console.error('Cleanup failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 