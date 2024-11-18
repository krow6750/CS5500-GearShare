import { NextResponse } from 'next/server';
import { booqableService } from '@/lib/booqable/booqableService';

export async function GET() {
  try {
    // Get all product groups
    const groups = await booqableService.makeRequest('/product_groups', 'GET');
    // Get all products
    const products = await booqableService.makeRequest('/products', 'GET');
    
    return NextResponse.json({
      groups: groups.product_groups,
      products: products.products
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 