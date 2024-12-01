import booqableService from '@/lib/booqable/booqableService';
import { logActivity } from '@/lib/utils/activityLogger';

export const equipmentService = {
  async createEquipment(data) {
    try {
      // Create in Booqable
      const booqableResult = await booqableService.createProduct({
        name: data.name,
        description: data.description,
        price: data.price,
        quantity: data.quantity
      });

      // Log equipment creation
      await logActivity({
        action_type: 'create',
        collection: 'equipment',
        description: `Added new equipment: ${data.name}`,
        details: {
          equipment_name: data.name,
          created_at: new Date().toISOString(),
          booqable_id: booqableResult.id
        }
      });

      return booqableResult;
    } catch (error) {
      console.error('Equipment creation failed:', error);
      throw error;
    }
  },

  async updateEquipment(id, data) {
    try {
      // Update in Booqable
      const updatedEquipment = await booqableService.updateProduct(id, {
        name: data.name,
        description: data.description,
        price: data.price,
        quantity: data.quantity
      });

      // Log equipment update
      await logActivity({
        action_type: 'update',
        collection: 'equipment',
        description: `Updated equipment: ${data.name}`,
        details: {
          equipment_name: data.name,
          updated_at: new Date().toISOString(),
          booqable_id: id
        }
      });

      return updatedEquipment;
    } catch (error) {
      console.error('Equipment update failed:', error);
      throw error;
    }
  }
}; 