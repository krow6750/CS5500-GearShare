import Airtable from 'airtable';

const AIRTABLE_API_KEY = process.env.ACTIVITY_LOG_AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_ACTIVITY_LOG_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.ACTIVITY_LOG_AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_ACTIVITY_LOG_AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY) {
  console.warn('ACTIVITY_LOG_AIRTABLE_API_KEY is not set in environment variables');
}

if (!AIRTABLE_BASE_ID) {
  console.warn('ACTIVITY_LOG_AIRTABLE_BASE_ID is not set in environment variables');
}

let airtable, base, activityLogTable;

if (AIRTABLE_API_KEY && AIRTABLE_BASE_ID) {
  airtable = new Airtable({ apiKey: AIRTABLE_API_KEY });
  base = airtable.base(AIRTABLE_BASE_ID);
  activityLogTable = base('Activity Log');
}
export const activityService = {
  async logActivity(data) {
    if (!activityLogTable) {
      console.warn('Airtable is not configured. Activity logging is disabled.');
      return null;
    }
    const activityData = {
      fields: {
        log_id: Date.now().toString(),
        activity_time: new Date().toISOString(),
        collection: data.collection || 'system',
        action_type: data.action_type,
        user_id: data.user_id || 'system',
        description: data.description,
        details: JSON.stringify({
          ...data.details,
          previous_state: data.previous_state,
          new_state: data.new_state,
          affected_id: data.affected_id
        })
      }
    };

    try {
      const createdRecord = await activityLogTable.create(activityData);
      return createdRecord;
    } catch (error) {
      console.error('Failed to log activity:', error);
      throw error;
    }
  },

  async getActivities(filters = {}) {
    if (!activityLogTable) {
      console.warn('Airtable is not configured. Unable to fetch activities.');
      return [];
    }
    try {
      let formula = '';

      // Apply date filters
      if (filters.dateRange && filters.dateRange !== 'all') {
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

        formula += `IS_AFTER({activity_time}, '${startDate.toISOString()}')`;
      }

      // Apply other filters
      if (filters.action_type) {
        formula += formula ? ' AND ' : '';
        formula += `{action_type} = '${filters.action_type}'`;
      }

      if (filters.collection) {
        formula += formula ? ' AND ' : '';
        formula += `{collection} = '${filters.collection}'`;
      }

      const records = await activityLogTable.select({
        filterByFormula: formula || 'TRUE()',
        sort: [{ field: 'activity_time', direction: 'desc' }]
      }).all();

      return records.map(record => ({
        id: record.id,
        log_id: record.fields.log_id,
        activity_time: record.fields.activity_time,
        collection: record.fields.collection,
        action_type: record.fields.action_type,
        user_id: record.fields.user_id,
        description: record.fields.description,
        details: JSON.parse(record.fields.details || '{}')
      }));
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      throw error;
    }
  }
};