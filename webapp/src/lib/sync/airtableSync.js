import { firebaseDB } from '../firebase/db';
import { COLLECTIONS } from '../firebase/models';
import { airtableService } from '../airtable/airtableService';

export const airtableSync = {
  async syncRepairs() {
    try {
      console.log('Starting repairs sync...');
      
      const firebaseRepairs = await firebaseDB.query(COLLECTIONS.REPAIRS);
      const airtableResponse = await airtableService.getRepairTickets();
      const airtableRepairs = airtableResponse.records;
      
      const airtableMap = new Map(
        airtableRepairs.map(record => [record.fields.firebase_id, record])
      );
      
      for (const repair of firebaseRepairs) {
        const airtableRecord = airtableMap.get(repair.id);
        
        if (!airtableRecord) {
          await airtableService.createRepairTicket(repair);
        } else {
          await airtableService.updateRepairTicket(airtableRecord.id, repair);
        }
      }
      
      console.log('Repairs sync completed');
      return true;
    } catch (error) {
      console.error('Repairs sync failed:', error);
      throw error;
    }
  },

  async syncEquipment() {
    try {
      console.log('Starting equipment sync...');
      
      const firebaseEquipment = await firebaseDB.query(COLLECTIONS.EQUIPMENT);
      const airtableResponse = await airtableService.getEquipment();
      const airtableEquipment = airtableResponse.records;
      
      const airtableMap = new Map(
        airtableEquipment.map(record => [record.fields.firebase_id, record])
      );
      
      // Map invalid categories to valid ones
      const categoryMap = {
        'Accessories': 'Other',
        'Cameras': 'Cameras',
        'Lenses': 'Lenses',
        'Lighting': 'Lighting',
        'Audio': 'Audio',
        'Grip': 'Grip',
        'Other': 'Other'
      };
      
      for (const equipment of firebaseEquipment) {
        try {
          // Map the category to a valid one
          const mappedEquipment = {
            ...equipment,
            equipment_category: categoryMap[equipment.equipment_category] || 'Other'
          };

          const airtableRecord = airtableMap.get(equipment.id);
          
          if (!airtableRecord) {
            await airtableService.createEquipment(mappedEquipment);
          } else {
            await airtableService.updateEquipment(airtableRecord.id, mappedEquipment);
          }
        } catch (error) {
          console.error(`Failed to sync equipment ${equipment.id}:`, error);
          // Continue with next item instead of failing entire sync
          continue;
        }
      }
      
      console.log('Equipment sync completed');
      return true;
    } catch (error) {
      console.error('Equipment sync failed:', error);
      throw error;
    }
  }
}; 