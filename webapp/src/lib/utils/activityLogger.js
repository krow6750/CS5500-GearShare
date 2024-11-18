import { firebaseDB } from '@/lib/firebase/db';
import { COLLECTIONS } from '@/lib/firebase/models';

export const logActivity = async ({
  action_type,
  collection,
  description,
  details = {}
}) => {
  try {
    console.log('logActivity called with:', { action_type, collection, description, details });
    
    // Remove any undefined values from details
    const cleanDetails = Object.entries(details).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});

    const activityData = {
      log_id: Date.now(),
      user_id: 'system',
      action_type,
      collection,
      description,
      details: cleanDetails,
      activity_time: new Date().toISOString()
    };

    console.log('Attempting to create activity log with data:', activityData);
    
    await firebaseDB.create(COLLECTIONS.ACTIVITY_LOGS, activityData);
    console.log('Successfully created activity log');
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw the error to prevent blocking the main operation
  }
};