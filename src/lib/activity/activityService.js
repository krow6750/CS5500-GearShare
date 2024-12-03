import 'dotenv/config';
import Airtable from 'airtable';

const AIRTABLE_API_KEY = process.env.NEXT_PUBLIC_AIRTABLE_ACTIVITY_LOG_API_KEY;
const AIRTABLE_BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_ACTIVITY_LOG_BASE_ID;
const TABLE_ID = 'tblkzYrg0xaVHaMeb';

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

export const activityService = {
  createActivityLog: async (actionType, description, collection) => {
    try {
      const logId = generateLogId();
      const activityTime = formatDate(new Date());

      const createdRecord = await base(TABLE_ID).create([{
        fields: {
          'logId': logId,
          'activityTime': activityTime,
          'actionType': description,
          'description': '',
          'collection': collection
        }
      }]);

      return createdRecord[0];
    } catch (error) {
      console.error('Error creating activity log:', error);
      throw error;
    }
  },

  fetchAllActivityLogs: async () => {
    try {
      const records = await base(TABLE_ID).select({
        sort: [{ field: 'activityTime', direction: 'desc' }]
      }).all();
      
      return records.map(record => ({
        id: record.id,
        fields: {
          logId: record.fields.logId,
          activityTime: record.fields.activityTime,
          actionType: record.fields.actionType,
          description: record.fields.description,
          collection: record.fields.collection
        }
      }));
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      throw error;
    }
  },

  logActivity: async (type, action, details) => {
    const logData = {
      type,       
      actionType: action, 
      description: generateDescription(type, action, details),
      activityTime: new Date().toISOString()
    };
    
    return await activityService.createActivityLog(logData.actionType, logData.description, logData.type);
  },

  logRepairActivity: async (action, details) => {
    const normalizedDetails = {
      customer: {
        name: details.customer?.name || 
              (details.fields ? `${details.fields['First Name']} ${details.fields['Last Name']}`.trim() : 'Customer')
      },
      itemType: details.itemType || details.fields?.['Item Type'] || 'item',
      status: details.status || details.fields?.['Status'],
      details: details.details || '',
      changes: details.changes || [],
      fields: {
        'Repair ID': details.fields?.['Repair ID'] || ''
      }
    };

    const actionType = action === 'create' ? 'created' : action === 'update' ? 'updated' : action;

    return activityService.logActivity('repair', actionType, normalizedDetails);
  },

  logRentalActivity: async (action, details) => {
    return activityService.logActivity('rental', action, details);
  },

  logEquipmentActivity: async (action, details) => {
    return activityService.logActivity('equipment', action, details);
  }
};

const generateLogId = () => {
  return Math.random().toString(36).substr(2, 9);
};

const formatDate = (date) => {
  const pad = (num) => (num < 10 ? '0' + num : num);
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

function generateDescription(type, action, details) {
  switch (type) {
    case 'repair':
      const repairId = details.fields?.['Repair ID'] || '';
      
      if (action === 'create') {
        return `Repair ticket #${repairId} created`;
      }
      
      if (action === 'update') {
        return `Repair ticket #${repairId} updated`;
      }
      
      return `Repair ticket #${repairId} ${action}`;
    
    case 'rental':
      return `${action} rental for ${details.customer?.name || 'customer'} - ${details.equipment?.name || 'item'}`;
    
    case 'equipment':
      return `${action} equipment: ${details.name || 'item'}`;
    
    default:
      return `${action} ${type}`;
  }
}

export default activityService;