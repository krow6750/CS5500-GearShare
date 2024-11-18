import { booqableService } from '@/lib/booqable/booqableService';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const order = await booqableService.getOrder(id);
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch order',
      details: error.message 
    }, { status: 500 });
  }
} 