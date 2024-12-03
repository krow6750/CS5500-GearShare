import Airtable from 'airtable';
import { TABLES, STATUS, DEFAULT_STATUS } from './models.js';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY) {
  throw new Error('AIRTABLE_API_KEY is required');
}

if (!AIRTABLE_BASE_ID) {
  throw new Error('AIRTABLE_BASE_ID is required');
}

const airtable = new Airtable({ apiKey: AIRTABLE_API_KEY });
const base = airtable.base(AIRTABLE_BASE_ID);

const transformRepairRecord = (record) => {
  const fields = record.fields || {};
  return {
    id: record.id,
    createdTime: record.createdTime,
    fields: {
      'First Name': fields['First Name'] || '',
      'Last Name': fields['Last Name'] || '',
      'Internal Notes': fields['Internal Notes'] || '',
      'Item Type': fields['Item Type'] || '',
      'Price Quote': parseFloat(fields['Price Quote']) || 0,
      'Final Price': parseFloat(fields['Final Price']) || 0,
      'Type of Item': fields['Type of Item'] || '',
      'Damage or Defect': fields['Damage or Defect'] || '',
      'Payment type': fields['Payment type'] || '',
      'Brand': fields['Brand'] || '',
      'Repair ID': fields['Repair ID'] || '',
      'Status': fields['Status'] || DEFAULT_STATUS,
      'Telephone': fields['Telephone'] || '',
      'Weight (Ounces)': parseInt(fields['Weight (Ounces)']) || 0,
      'Color': fields['Color'] || '',
      'Photo/Attachment': Array.isArray(fields['Photo/Attachment']) 
        ? fields['Photo/Attachment'].map(photo => ({
            id: photo.id,
            width: photo.width,
            height: photo.height,
            url: photo.url,
            filename: photo.filename,
            size: photo.size,
            type: photo.type,
            thumbnails: {
              small: photo.thumbnails?.small ? {
                url: photo.thumbnails.small.url,
                width: photo.thumbnails.small.width,
                height: photo.thumbnails.small.height
              } : null,
              large: photo.thumbnails?.large ? {
                url: photo.thumbnails.large.url,
                width: photo.thumbnails.large.width,
                height: photo.thumbnails.large.height
              } : null,
              full: photo.thumbnails?.full ? {
                url: photo.thumbnails.full.url,
                width: photo.thumbnails.full.width,
                height: photo.thumbnails.full.height
              } : null
            }
          }))
        : [],
      'Referred By': fields['Referred By'] || '',
      'Requestor Type': fields['Requestor Type'] || '',
      'Submitted On': fields['Submitted On'] || null,
      'Created': fields['Created'] || null,
      'Date Quoted': fields['Date Quoted'] || null,
      '(For Zapier)': fields['(For Zapier)'] || null,
      'Owner': fields['Owner'] ? {
        id: fields['Owner'].id,
        email: fields['Owner'].email,
        name: fields['Owner'].name
      } : null,
      'Delivery of Item': fields['Delivery of Item'] || '',
      'Email': fields['Email'] || '',
      'Autonumber': parseInt(fields['Autonumber']) || 0,
      'Amount Paid': parseFloat(fields['Amount Paid']) || 0,
      'Sent Email': fields['Sent Email'] || false,
    }
  };
};

const validateRepairData = (repairData) => {
  const requiredFields = ['First Name', 'Last Name', 'Status'];
  const missingFields = requiredFields.filter(field => !repairData[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  if (repairData['Status'] && !STATUS.STATUS[repairData['Status']]) {
    throw new Error(`Invalid Status: ${repairData['Status']}. Must be one of: ${Object.keys(STATUS.STATUS).join(', ')}`);
  }

  if (repairData['Payment type'] && !STATUS.PAYMENTTYPE[repairData['Payment type']]) {
    throw new Error(`Invalid Payment type: ${repairData['Payment type']}. Must be one of: ${Object.keys(STATUS.PAYMENTTYPE).join(', ')}`);
  }

  if (repairData['Requestor Type'] && !STATUS.REQUESTOR_TYPE[repairData['Requestor Type']]) {
    throw new Error(`Invalid Requestor Type: ${repairData['Requestor Type']}. Must be one of: ${Object.keys(STATUS.REQUESTOR_TYPE).join(', ')}`);
  }

  const numericFields = {
    'Price Quote': parseFloat,
    'Final Price': parseFloat,
    'Amount Paid': parseFloat,
    'Weight (Ounces)': parseInt,
    'Autonumber': parseInt
  };

  Object.entries(numericFields).forEach(([field, parser]) => {
    if (repairData[field] !== undefined && repairData[field] !== null) {
      const parsed = parser(repairData[field]);
      if (isNaN(parsed)) {
        throw new Error(`Invalid numeric value for ${field}: ${repairData[field]}`);
      }
      repairData[field] = parsed;
    } else {
      repairData[field] = 0;
    }
  });

  if (repairData['Photo/Attachment']) {
    if (!Array.isArray(repairData['Photo/Attachment'])) {
      repairData['Photo/Attachment'] = [repairData['Photo/Attachment']];
    }
    
    repairData['Photo/Attachment'] = repairData['Photo/Attachment']
      .filter(photo => photo && photo.url) 
      .map(photo => ({
        url: photo.url 
      }));
  } else {
    repairData['Photo/Attachment'] = []; 
  }

  const dateFields = ['Submitted On', 'Created', 'Date Quoted', '(For Zapier)'];
  dateFields.forEach(field => {
    if (repairData[field]) {
      const date = new Date(repairData[field]);
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date format for ${field}`);
      }
      repairData[field] = date.toISOString();
    } else {
      repairData[field] = null;
    }
  });

  if (repairData['Owner']) {
    if (typeof repairData['Owner'] !== 'object' || !repairData['Owner'].id || !repairData['Owner'].email || !repairData['Owner'].name) {
      throw new Error('Owner must be an object with id, email, and name');
    }

    repairData['Owner'] = {
      id: repairData['Owner'].id,  
      email: repairData['Owner'].email,
      name: repairData['Owner'].name
    };

    console.log('Validated Owner object:', repairData['Owner']);
  }

  const singleSelectValidations = {
    'Status': [
      "Finished, Picked Up",
      "Contacted, Awaiting Customer Response",
      "Awaiting Drop-Off",
      "Can't Repair",
      "Finished + Paid, In Drop-Box",
      "Dropped Off, Awaiting Repair",
      "Finished, Customer Contacted",
      "In Repair"
    ],
    'Payment type': ["cash", "check", "Square", "Venmo", "combo"],
    'Delivery of Item': [
      "I'll drop it off at Maine GearShare (BRUNSWICK)",
      "I'll mail it",
      "Repair Event",
      "I'll drop it off at Toad & Co. (PORTLAND)"
    ],
    'Requestor Type': [
      "Board/Staff",
      "Paying Customer",
      "MGS/Internal",
      "Maloja Warranty",
      "Free, repair event",
      "Stio Warranty"
    ],
    'Item Type': [
      "Jacket",
      "Tent",
      "Sleeping Bag",
      "Backpack",
      "Hammock",
      "Luggage",
      "Other"
    ]
  };

  Object.entries(singleSelectValidations).forEach(([field, allowedValues]) => {
    if (repairData[field] && !allowedValues.includes(repairData[field])) {
      throw new Error(`Invalid ${field}: ${repairData[field]}. Must be one of: ${allowedValues.join(', ')}`);
    }
  });

  if (repairData['Weight (Ounces)']) {
    repairData['Weight (Ounces)'] = parseFloat(repairData['Weight (Ounces)']).toFixed(1);
  }

  ['Price Quote', 'Final Price', 'Amount Paid'].forEach(field => {
    if (repairData[field]) {
      repairData[field] = parseFloat(repairData[field]).toFixed(2);
    }
  });

  if (repairData['Autonumber']) {
    repairData['Autonumber'] = Math.max(0, Math.floor(Number(repairData['Autonumber'])));
  }

  return repairData;
};

export const airtableService = {
  createRepairTicket: async (repairData) => {
    try {
      if (repairData['Repair ID']) {
        const existingRepair = await airtableService.findRepairByTicketId(repairData['Repair ID']);
        if (existingRepair) {
          throw new Error(`Repair ticket with ID ${repairData['Repair ID']} already exists`);
        }
      }

      console.log('Attempting to create repair in Airtable:', repairData);
      
      const validatedData = validateRepairData(repairData);
      
      const fields = {
        'First Name': String(validatedData['First Name'] || ''),
        'Last Name': String(validatedData['Last Name'] || ''),
        'Internal Notes': String(validatedData['Internal Notes'] || ''),
        'Type of Item': String(validatedData['Type of Item'] || ''),
        'Brand': String(validatedData['Brand'] || ''),
        'Repair ID': String(validatedData['Repair ID'] || ''),
        'Color': String(validatedData['Color'] || ''),
        'Damage or Defect': String(validatedData['Damage or Defect'] || ''),
        'Referred By': String(validatedData['Referred By'] || ''),
        
        'Status': validatedData['Status'] || DEFAULT_STATUS,
        'Payment type': validatedData['Payment type'] || '',  
        'Delivery of Item': validatedData['Delivery of Item'] || '',
        'Requestor Type': validatedData['Requestor Type'] || '',
        'Item Type': validatedData['Item Type'] || '',  
        
        'Price Quote': Math.max(0, parseFloat(validatedData['Price Quote']) || 0),
        'Final Price': Math.max(0, parseFloat(validatedData['Final Price']) || 0),
        'Amount Paid': Math.max(0, parseFloat(validatedData['Amount Paid']) || 0),
        'Weight (Ounces)': Math.max(0, parseFloat(validatedData['Weight (Ounces)']) || 0),
        
        'Submitted On': validatedData['Submitted On'] ? new Date(validatedData['Submitted On']).toISOString().split('T')[0] : null,
        'Created': validatedData['Created'] ? new Date(validatedData['Created']).toISOString().split('T')[0] : null,
        'Date Quoted': validatedData['Date Quoted'] ? new Date(validatedData['Date Quoted']).toISOString().split('T')[0] : null,
        
        '(For Zapier)': validatedData['(For Zapier)'] ? new Date(validatedData['(For Zapier)']).toISOString() : null,
        'Paid On': validatedData['Paid On'] ? new Date(validatedData['Paid On']).toISOString() : null,
        
        'Telephone': String(validatedData['Telephone'] || ''),
        
        'Email': String(validatedData['Email'] || ''),
        
        'Photo/Attachment': Array.isArray(validatedData['Photo/Attachment']) 
          ? validatedData['Photo/Attachment'].map(photo => ({
              url: photo.url,  
              filename: photo.filename,
              type: photo.type
            }))
          : [],
        'Send Date Quote': String(validatedData['Send Date Quote'] || ''),
        'Send Price Email': String(validatedData['Send Price Email'] || ''),
        'Repair Event': String(validatedData['Repair Event'] || ''),
        'Sent Email': validatedData['Sent Email'] || false,
      };

      console.log('Validated fields for Airtable:', fields);

      const result = await base(TABLES.REPAIRS).create([{ fields }], {
        typecast: true  
      });
      
      if (!result || !result.length) {
        throw new Error('No response from Airtable create');
      }

      return transformRepairRecord(result[0]);
    } catch (error) {
      console.error('Create repair ticket error:', {
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
      
      const validatedData = validateRepairData(repairData);
      
      const fields = {
        'First Name': validatedData['First Name'],
        'Last Name': validatedData['Last Name'],
        'Internal Notes': validatedData['Internal Notes'] || '',
        'Item Type': validatedData['Item Type'] || '',
        'Price Quote': parseFloat(validatedData['Price Quote']) || 0,
        'Final Price': parseFloat(validatedData['Final Price']) || 0,
        'Type of Item': validatedData['Type of Item'] || '',
        'Damage or Defect': validatedData['Damage or Defect'] || '',
        'Payment type': validatedData['Payment type'] || '',
        'Brand': validatedData['Brand'] || '',
        'Repair ID': validatedData['Repair ID'] || '',
        'Status': validatedData['Status'] || DEFAULT_STATUS,
        'Telephone': validatedData['Telephone'] || '',
        'Weight (Ounces)': parseInt(validatedData['Weight (Ounces)']) || 0,
        'Color': validatedData['Color'] || '',
        'Photo/Attachment': validatedData['Photo/Attachment'] || [],
        'Referred By': validatedData['Referred By'] || '',
        'Requestor Type': validatedData['Requestor Type'] || '',
        'Submitted On': validatedData['Submitted On'],
        'Created': validatedData['Created'],
        'Date Quoted': validatedData['Date Quoted'],
        '(For Zapier)': validatedData['(For Zapier)'],
        'Owner': validatedData['Owner'],
        'Delivery of Item': validatedData['Delivery of Item'] || '',
        'Email': validatedData['Email'] || '',
        'Amount Paid': parseFloat(validatedData['Amount Paid']) || 0,
        'Sent Email': validatedData['Sent Email'] || false,
      };

      const response = await base(TABLES.REPAIRS).update([
        {
          id: airtableId,
          fields
        }
      ]);

      return transformRepairRecord(response[0]);
    } catch (error) {
      console.error('Update repair ticket error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        airtableId,
        data: repairData
      });
      throw error;
    }
  },
  findRepairByTicketId: async (repairTicketId) => {
    try {
      const records = await base(TABLES.REPAIRS).select({
        filterByFormula: `{Repair ID} = '${repairTicketId}'`
      }).firstPage();
      
      return records.length > 0 ? transformRepairRecord(records[0]) : null;
    } catch (error) {
      console.error('Error finding repair in Airtable:', {
        error,
        repairTicketId
      });
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
      console.log('Attempting to recreate repair ticket:', repairData);
      
      const validatedData = validateRepairData(repairData);
      
      const fields = {
        'First Name': validatedData['First Name'],
        'Last Name': validatedData['Last Name'],
        'Internal Notes': validatedData['Internal Notes'] || '',
        'Item Type': validatedData['Item Type'] || '',
        'Price Quote': parseFloat(validatedData['Price Quote']) || 0,
        'Final Price': parseFloat(validatedData['Final Price']) || 0,
        'Type of Item': validatedData['Type of Item'] || '',
        'Damage or Defect': validatedData['Damage or Defect'] || '',
        'Payment type': validatedData['Payment type'] || '',
        'Brand': validatedData['Brand'] || '',
        'Repair ID': validatedData['Repair ID'] || '',
        'Status': validatedData['Status'] || DEFAULT_STATUS,
        'Telephone': validatedData['Telephone'] || '',
        'Weight (Ounces)': parseInt(validatedData['Weight (Ounces)']) || 0,
        'Color': validatedData['Color'] || '',
        'Photo/Attachment': validatedData['Photo/Attachment'] || [],
        'Referred By': validatedData['Referred By'] || '',
        'Requestor Type': validatedData['Requestor Type'] || '',
        'Submitted On': validatedData['Submitted On'],
        'Created': validatedData['Created'],
        'Date Quoted': validatedData['Date Quoted'],
        '(For Zapier)': validatedData['(For Zapier)'],
        'Owner': validatedData['Owner'],
        'Delivery of Item': validatedData['Delivery of Item'] || '',
        'Email': validatedData['Email'] || '',
        'Autonumber': parseInt(validatedData['Autonumber']) || 0,
        'Amount Paid': parseFloat(validatedData['Amount Paid']) || 0,
        'Sent Email': validatedData['Sent Email'] || false,
      };

      console.log('Validated fields for recreation:', fields);

      const result = await base(TABLES.REPAIRS).create([{ fields }]);
      
      if (!result || !result.length) {
        throw new Error('No response from Airtable create');
      }

      return transformRepairRecord(result[0]);
    } catch (error) {
      console.error('Failed to recreate repair in Airtable:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        data: repairData
      });
      throw error;
    }
  },

  fetchAllRepairTickets: async () => {
    try {
      const response = await base(TABLES.REPAIRS).select().all();
      return response.map(transformRepairRecord);
    } catch (error) {
      console.error('Error fetching repair tickets:', error);
      throw error;
    }
  },

  getRepairTicket: async (recordId) => {
    try {
      const record = await base(TABLES.REPAIRS).find(recordId);
      return transformRepairRecord(record);
    } catch (error) {
      console.error('Error getting repair from Airtable:', {
        error,
        recordId
      });
      throw error;
    }
  }
}; 