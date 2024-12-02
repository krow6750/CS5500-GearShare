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
          'actionType': actionType,
          'description': description,
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

  logRentalActivity: async (action, rentalDetails) => {
    try {
      const actionTypes = {
        create: 'RENTAL_CREATED',
        update: 'RENTAL_UPDATED',
        delete: 'RENTAL_DELETED'
      };

      const description = `Rental ${action}: ${
        rentalDetails.customer?.name || 'Unknown Customer'
      } - ${rentalDetails.equipment?.name || 'Unknown Equipment'}`;

      return await activityService.createActivityLog(
        actionTypes[action] || 'RENTAL_ACTION',
        description,
        'rentals'
      );
    } catch (error) {
      console.error(`Error logging rental ${action}:`, error);
      throw error;
    }
  }
};

const generateLogId = () => {
  return Math.random().toString(36).substr(2, 9);
};

const formatDate = (date) => {
  const pad = (num) => (num < 10 ? '0' + num : num);
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default activityService;