import { firebaseDB } from '@/lib/firebase/db';
import { COLLECTIONS } from '@/lib/firebase/models';

export const activityService = {
  async logActivity(data) {
    const activityData = {
      log_id: Date.now(),
      activity_time: new Date().toISOString(),
      collection: data.collection || 'system',
      action_type: data.action_type,
      user_id: data.user_id || 'system',
      description: data.description,
      details: {
        ...data.details,
        previous_state: data.previous_state,
        new_state: data.new_state,
        affected_id: data.affected_id
      }
    };

    return firebaseDB.create(COLLECTIONS.ACTIVITY_LOGS, activityData);
  },

  async getActivities(filters) {
    try {
      let activities = await firebaseDB.query(COLLECTIONS.ACTIVITY_LOGS);

      // Apply date filters
      if (filters.dateRange !== 'all') {
        const now = new Date();
        let startDate = new Date();

        switch (filters.dateRange) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        }

        activities = activities.filter(activity => 
          new Date(activity.activity_time) >= startDate
        );
      }

      // Apply other filters and sort by time descending
      return activities
        .filter(activity => {
          if (filters.action_type && activity.action_type !== filters.action_type) return false;
          if (filters.collection && activity.collection !== filters.collection) return false;
          return true;
        })
        .sort((a, b) => new Date(b.activity_time) - new Date(a.activity_time));
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      throw error;
    }
  }
}; 