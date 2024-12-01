
import { NextResponse } from 'next/server';
import { booqableService } from '@/lib/booqable/booqableService';

export async function GET() {
  try {
    // Get all orders
    const orders = await booqableService.makeRequest('/orders', 'GET');
    return NextResponse.json({
      success: true,
      orders: orders.orders,
      count: orders.orders?.length || 0
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}