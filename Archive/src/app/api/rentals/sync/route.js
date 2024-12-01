import { NextResponse } from 'next/server';
import { syncBooqableOrders } from '@/lib/booqable/sync';

export async function POST() {
  try {
    await syncBooqableOrders();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sync failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 