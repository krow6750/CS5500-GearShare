'use server'

import { syncBooqableOrders } from '@/lib/booqable/sync';

export async function syncRentals() {
  try {
    const result = await syncBooqableOrders();
    return { success: true, timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('Sync failed:', error);
    return { success: false, error: error.message };
  }
} 