import Airtable from 'airtable';
import { TABLES } from './models';

const AIRTABLE_API_KEY = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

console.log('Airtable Config:', {
  apiKey: AIRTABLE_API_KEY ? 'Set' : 'Not Set',
  baseId: AIRTABLE_BASE_ID
});

if (!AIRTABLE_API_KEY) {
  throw new Error('Missing AIRTABLE_API_KEY environment variable');
}

const airtable = new Airtable({ apiKey: AIRTABLE_API_KEY });
const base = airtable.base(AIRTABLE_BASE_ID);

export const airtableService = {
  createEquipment: async (equipmentData) => {
    try {
      console.log('Attempting to create equipment in Airtable:', equipmentData);
      
      const fields = {
        'equipment_id': equipmentData.equipment_id,
        'name': equipmentData.name,
        'equipment_category': equipmentData.equipment_category,
        'status': equipmentData.status,
        'description': equipmentData.description,
        'price': equipmentData.price,
        'quantity': equipmentData.quantity,
        'booqable_id': equipmentData.booqableId,
        'booqableGroupId': equipmentData.booqableGroupId,
        'created_at': equipmentData.created_at
      };

      console.log('Formatted fields for Airtable:', fields);

      const response = await base(TABLES.EQUIPMENT).create([
        { fields }
      ]);

      console.log('Airtable response:', response);

      if (!response || !response.length) {
        throw new Error('No response from Airtable create');
      }

      return response[0];
    } catch (error) {
      console.error('Detailed Airtable error:', error);
      throw error;
    }
  },
  createRepairTicket: async (repairData) => {
    try {
      console.log('Attempting to create repair in Airtable:', repairData);
      
      const fields = {
        'repair_ticket_id': repairData.repair_ticket_id,
        'equipment_type': repairData.equipment_type,
        'reported_by': repairData.reported_by,
        'assigned_to': repairData.assigned_to,
        'issue_description': repairData.issue_description,
        'start_date': repairData.start_date,
        'end_date': repairData.end_date || null,
        'status': repairData.status,
        'cost': parseFloat(repairData.cost) || 0,
        'estimate_repair_time': parseInt(repairData.estimate_repair_time) || 0
      };

      console.log('Formatted fields for Airtable:', fields);

      const response = await base(TABLES.REPAIRS).create([
        { fields }
      ]);

      return response[0];
    } catch (error) {
      console.error('Detailed Airtable error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        data: repairData
      });
      throw error;
    }
  },
  updateRepairTicket: async (airtableId, repairData) => {
    try {
      console.log('Updating Airtable record:', { airtableId, repairData });
      
      const fields = {
        'repair_ticket_id': repairData.repair_ticket_id,
        'equipment_type': repairData.equipment_type,
        'reported_by': repairData.reported_by,
        'assigned_to': repairData.assigned_to,
        'issue_description': repairData.issue_description,
        'start_date': repairData.start_date,
        'end_date': repairData.end_date || null,
        'status': repairData.status,
        'cost': parseFloat(repairData.cost) || 0,
        'estimate_repair_time': parseInt(repairData.estimate_repair_time) || 0
      };

      const response = await base(TABLES.REPAIRS).update([
        {
          id: airtableId,
          fields
        }
      ]);

      console.log('Airtable update response:', response);
      return response[0];
    } catch (error) {
      console.error('Airtable update error:', error);
      throw error;
    }
  },
  findRepairByTicketId: async (repairTicketId) => {
    try {
      const records = await base(TABLES.REPAIRS).select({
        filterByFormula: `{repair_ticket_id} = '${repairTicketId}'`
      }).firstPage();
      
      return records.length > 0 ? records[0] : null;
    } catch (error) {
      console.error('Error finding repair in Airtable:', error);
      throw error;
    }
  },
  deleteRepairTicket: async (recordId) => {
    try {
      const result = await base(TABLES.REPAIRS).destroy([recordId]);
      if (!result || result.length === 0) {
        throw new Error('No record was deleted from Airtable');
      }
      console.log('Successfully deleted repair from Airtable:', recordId);
      return result[0];
    } catch (error) {
      console.error('Failed to delete repair from Airtable:', error);
      throw error;
    }
  },
  recreateRepairTicket: async (repairData) => {
    try {
      const fields = {
        'repair_ticket_id': repairData.repair_ticket_id,
        'equipment_type': repairData.equipment_type,
        'reported_by': repairData.reported_by,
        'assigned_to': repairData.assigned_to,
        'issue_description': repairData.issue_description,
        'start_date': repairData.start_date,
        'end_date': repairData.end_date || null,
        'status': repairData.status,
        'cost': parseFloat(repairData.cost) || 0,
        'estimate_repair_time': parseInt(repairData.estimate_repair_time) || 0
      };

      const result = await base(TABLES.REPAIRS).create([{ fields }]);
      return result[0];
    } catch (error) {
      console.error('Failed to recreate repair in Airtable:', error);
      throw error;
    }
  },
  getEquipment: async () => {
    try {
      const records = await base(TABLES.EQUIPMENT).select({
        maxRecords: 10,
        view: 'Grid view'
      }).firstPage();
      
      return { records };
    } catch (error) {
      console.error('Airtable service error:', error);
      throw error;
    }
  }
}; 