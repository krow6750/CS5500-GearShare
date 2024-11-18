import { NextResponse } from 'next/server';
import { booqableService } from '@/lib/booqable/booqableService';

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Test rental data:', data);

    // 1. Verify product exists
    const productsResponse = await booqableService.makeRequest('/products', 'GET');
    const product = productsResponse.products.find(p => p.id === data.equipment_booqable_id);
    
    if (!product) {
      throw new Error(`Product not found: ${data.equipment_booqable_id}`);
    }

    // 2. Create test order
    const response = await booqableService.createRental(data);

    return NextResponse.json({
      success: true,
      order: response.order,
      product: product
    });
  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 