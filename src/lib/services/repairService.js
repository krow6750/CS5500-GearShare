import { airtableService } from '@/lib/airtable/airtableService';

export const repairService = {
  async createRepair(data) {
    try {
      const repairRecord = await airtableService.createRepairTicket(data);

      if (repairRecord.fields.Email) {
        const emailResult = await emailService.sendRepairUpdate({
          repair_ticket_id: repairRecord.fields['Repair ID'],
          status: repairRecord.fields.Status,
          equipment_type: repairRecord.fields['Type of Item'],
          notes: repairRecord.fields['Damage or Defect']
        }, repairRecord.fields.Email);

        if (!emailResult.success) {
          console.warn('Email notification failed:', emailResult.error);
        }
      }

      return repairRecord;
    } catch (error) {
      console.error('Failed to create repair:', error);
      throw error;
    }
  },

  async updateRepair(airtableId, data) {
    try {
      const currentRepair = await airtableService.getRepairTicket(airtableId);
      const updatedRepair = await airtableService.updateRepairTicket(airtableId, data);

      if (currentRepair.fields.Status !== updatedRepair.fields.Status 
          && updatedRepair.fields.Email) {
        const emailResult = await emailService.sendRepairUpdate({
          repair_ticket_id: updatedRepair.fields['Repair ID'],
          status: updatedRepair.fields.Status,
          equipment_type: updatedRepair.fields['Type of Item'],
          notes: updatedRepair.fields['Damage or Defect']
        }, updatedRepair.fields.Email);

        if (!emailResult.success) {
          console.warn('Status update email notification failed:', emailResult.error);
        }
      }
      
      return updatedRepair;
    } catch (error) {
      console.error('Repair update failed:', error);
      throw error;
    }
  },

  async getRepair(airtableId) {
    try {
      return await airtableService.getRepairTicket(airtableId);
    } catch (error) {
      console.error('Failed to get repair:', error);
      throw error;
    }
  },

  async getAllRepairs() {
    try {
      return await airtableService.fetchAllRepairTickets();
    } catch (error) {
      console.error('Failed to get repairs:', error);
      throw error;
    }
  },

  async findRepairByTicketId(repairTicketId) {
    try {
      return await airtableService.findRepairByTicketId(repairTicketId);
    } catch (error) {
      console.error('Failed to find repair by ticket ID:', error);
      throw error;
    }
  },

  async deleteRepair(recordId) {
    try {
      return await airtableService.deleteRepairTicket(recordId);
    } catch (error) {
      console.error('Failed to delete repair:', error);
      throw error;
    }
  },

  async recreateRepair(data) {
    try {
      const repairRecord = await airtableService.recreateRepairTicket(data);
      
      if (repairRecord.fields.Email) {
        const emailResult = await emailService.sendRepairUpdate({
          repair_ticket_id: repairRecord.fields['Repair ID'],
          status: repairRecord.fields.Status,
          equipment_type: repairRecord.fields['Type of Item'],
          notes: repairRecord.fields['Damage or Defect']
        }, repairRecord.fields.Email);

        if (!emailResult.success) {
          console.warn('Recreation email notification failed:', emailResult.error);
        }
      }

      return repairRecord;
    } catch (error) {
      console.error('Failed to recreate repair:', error);
      throw error;
    }
  }
}; 