import { airtableService } from '../airtable/airtableService';
import { booqableService } from '@/lib/booqable/booqableService';

export const syncService = {
  async syncRentals() {
    try {
      const booqableRentals = await booqableService.fetchRentals();
      await airtableService.syncRentals(booqableRentals);
    } catch (error) {
      console.error('Rental sync failed:', error);
      throw error;
    }
  }
};

export const syncBooqableOrders = async () => {
  try {
    return await syncService.syncRentals();you 
  } catch (error) {
    console.error('Failed to sync Booqable orders:', error);
    throw error;
  }
}; 