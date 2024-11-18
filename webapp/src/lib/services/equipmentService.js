import { firebaseDB } from '@/lib/firebase/db';
import { COLLECTIONS } from '@/lib/firebase/models';
import { booqableService } from '@/lib/booqable/booqableService';
import { airtableService } from '@/lib/airtable/airtableService';
import { logActivity } from '@/lib/utils/activityLogger';

export const equipmentService = {
  async createEquipment(data) {
    try {
      // 1. Create in Booqable first
      const booqableResult = await booqableService.createProduct({
        name: data.name,
        description: data.description,
        price: data.price,
        quantity: data.quantity
      });

      // 2. Create in Firebase with Booqable IDs
      const firebaseData = {
        ...data,
        equipment_id: Date.now(),
        booqableId: booqableResult.product.id,
        booqableGroupId: booqableResult.group.id,
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      };

      const docRef = await firebaseDB.create(COLLECTIONS.EQUIPMENT, firebaseData);
      console.log('Firebase document created with ID:', docRef);

      // 3. Create in Airtable with all IDs
      const airtableData = {
        ...data,
        equipment_id: firebaseData.equipment_id,
        booqableId: booqableResult.product.id,
        booqableGroupId: booqableResult.group.id,
        created_at: firebaseData.created_at
      };

      await airtableService.createEquipment(airtableData);

      // Log equipment creation with only defined values
      const logDetails = {
        equipment_id: firebaseData.equipment_id,
        equipment_type: data.equipment_category || 'Unknown',
        equipment_name: data.name,
        created_at: firebaseData.created_at,
        booqable_id: booqableResult.product.id,
        booqable_group_id: booqableResult.group.id
      };

      // Only add firebase_id if it exists
      if (docRef?.id) {
        logDetails.firebase_id = docRef.id;
      }

      await logActivity({
        action_type: 'create',
        collection: 'equipment',
        description: `Added new equipment: ${data.name}`,
        details: logDetails
      });

      return {
        ...firebaseData,
        id: docRef?.id,
        booqableId: booqableResult.product.id,
        booqableGroupId: booqableResult.group.id
      };
    } catch (error) {
      console.error('Equipment creation failed:', error);
      throw error;
    }
  },

  async updateEquipment(id, data) {
    try {
      const equipment = await firebaseDB.get(COLLECTIONS.EQUIPMENT, id);
      const previousState = { ...equipment }; // Store previous state for logging
      
      // 1. Update in Booqable
      if (equipment.booqable_product_id) {
        await booqableService.updateProduct(equipment.booqable_product_id, {
          name: data.name,
          description: data.description,
          price: data.price,
          quantity: data.quantity
        });
      }

      // 2. Update in Firebase
      const firebaseData = {
        ...data,
        last_updated: new Date().toISOString()
      };
      await firebaseDB.update(COLLECTIONS.EQUIPMENT, id, firebaseData);

      // 3. Update in Airtable
      await airtableService.updateEquipment(id, {
        ...data,
        firebase_id: id
      });

      // Log equipment update with more detailed information
      await logActivity({
        action_type: 'update',
        collection: 'equipment',
        description: `Updated equipment: ${data.name}`,
        details: {
          equipment_id: id,
          equipment_name: data.name || 'Unknown',
          previous_state: JSON.parse(JSON.stringify(previousState)),
          new_state: JSON.parse(JSON.stringify(firebaseData)),
          updated_fields: Object.keys(data),
          updated_at: firebaseData.last_updated
        }
      });

      return { id, ...data };
    } catch (error) {
      console.error('Equipment update failed:', error);
      throw error;
    }
  }
}; 