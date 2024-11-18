import { firebaseDB } from '@/lib/firebase/db';
import { COLLECTIONS } from '@/lib/firebase/models';
import { airtableService } from '@/lib/airtable/airtableService';
import { emailService } from '@/lib/email/emailService';
import { logActivity } from '@/lib/utils/activityLogger';

export const repairService = {
  async createRepair(data) {
    try {
      // Create in Firebase
      const repairRef = await firebaseDB.create(COLLECTIONS.REPAIRS, {
        ...data,
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      });

      // Log repair creation
      await logActivity({
        action_type: 'create',
        collection: 'repairs',
        description: `Created repair ticket #${data.repair_ticket_id}`,
        details: {
          repair_id: repairRef,
          equipment_type: data.equipment_type
        }
      });

      // Get user email and send notification
      const user = await firebaseDB.get(COLLECTIONS.USERS, data.reported_by);
      if (user?.email) {
        const emailResult = await emailService.sendRepairUpdate({
          repair_ticket_id: data.repair_ticket_id,
          status: data.status,
          equipment_type: data.equipment_type,
          notes: data.issue_description
        }, user.email);

        if (!emailResult.success) {
          console.warn('Email notification failed:', emailResult.error);
          // Continue with repair creation even if email fails
        }
      }

      return repairRef;
    } catch (error) {
      console.error('Failed to create repair:', error);
      throw error;
    }
  },

  async updateRepair(id, data) {
    try {
      // Update in Firebase
      const updatedRepair = await firebaseDB.update(COLLECTIONS.REPAIRS, id, {
        ...data,
        last_updated: new Date().toISOString()
      });

      // Update in Airtable
      await airtableService.updateRepairTicket(id, data);

      // Log repair update
      await logActivity({
        action_type: 'update',
        collection: 'repairs',
        description: `Updated repair ticket #${data.repair_ticket_id}`,
        details: {
          repair_id: id,
          status: data.status,
          changes: data
        }
      });

      // Send email notifications for status changes
      if (data.status) {
        const repair = await firebaseDB.get(COLLECTIONS.REPAIRS, id);
        const user = await firebaseDB.get(COLLECTIONS.USERS, repair.reported_by);
        
        if (user?.email) {
          // Send completion notification if repair is completed
          if (data.status === 'completed') {
            await emailService.sendTemplatedEmail(
              user.email,
              'repair_completion',
              {
                ticketId: repair.repair_ticket_id,
                equipmentType: repair.equipment_type,
                completionDate: new Date().toLocaleDateString(),
                notes: repair.notes || 'No additional notes'
              }
            );
          }
        }
      }

      return updatedRepair;
    } catch (error) {
      console.error('Repair update failed:', error);
      throw error;
    }
  }
}; 