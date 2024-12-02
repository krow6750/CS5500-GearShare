import { airtableService } from '../airtable/airtableService';

export const syncService = {
  async logActivity(activity) {
    try {
      const logData = {
        'Action Type': activity.action_type,
        'Description': activity.description,
        'Timestamp': new Date().toISOString(),
        'Details': JSON.stringify(activity.details)
      };
      
      await airtableService.createActivityLog(logData);
    } catch (error) {
      console.error('Activity log error:', error);
      throw error;
    }
  }
};