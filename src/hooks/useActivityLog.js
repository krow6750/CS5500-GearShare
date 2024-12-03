
require('dotenv').config();
const axios = require('axios');

const AIRTABLE_ACTIVITY_LOG_API_KEY = process.env.AIRTABLE_ACTIVITY_LOG_API_KEY;
const AIRTABLE_ACTIVITY_LOG_BASE_ID = process.env.AIRTABLE_ACTIVITY_LOG_BASE_ID;
const AIRTABLE_ACTIVITY_LOG_TABLE_ID = 'tblkzYrg0xaVHaMeb';

console.log('API Key:', AIRTABLE_ACTIVITY_LOG_API_KEY ? 'Set' : 'Not set');
console.log('Base ID:', AIRTABLE_ACTIVITY_LOG_BASE_ID);
console.log('Table ID:', AIRTABLE_ACTIVITY_LOG_TABLE_ID);

if (!AIRTABLE_ACTIVITY_LOG_API_KEY) {
  console.error('AIRTABLE_ACTIVITY_LOG_API_KEY is not set in environment variables');
  process.exit(1);
}

const generateLogId = () => {
  return Math.random().toString(36).substr(2, 9);
};

const formatDate = (date) => {
  const pad = (num) => (num < 10 ? '0' + num : num);
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const createActivityLog = async (collection, actionType, description) => {
  const validatedCollection = String(collection);
  const validatedActionType = String(actionType);
  const validatedDescription = String(description);
  const logId = generateLogId();
  const activityTime = formatDate(new Date());

  const logEntry = {
    fields: {
      logId: logId,
      activityTime: activityTime,
      collection: validatedCollection,
      actionType: validatedActionType,
      description: validatedDescription
    }
  };

  try {
    console.log('Sending request to Airtable...');
    console.log('URL:', `https://api.airtable.com/v0/${AIRTABLE_ACTIVITY_LOG_BASE_ID}/${AIRTABLE_ACTIVITY_LOG_TABLE_ID}`);
    console.log('Data:', JSON.stringify(logEntry));
    const response = await axios.post(
      `https://api.airtable.com/v0/${AIRTABLE_ACTIVITY_LOG_BASE_ID}/${AIRTABLE_ACTIVITY_LOG_TABLE_ID}`,
      { records: [logEntry] },
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_ACTIVITY_LOG_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Activity log created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating activity log:', error.response ? error.response.data : error.message);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    throw error;
  }
};

const fetchAllLogs = async () => {
  try {
    console.log('Fetching logs from Airtable...');
    const response = await axios.get(
      `https://api.airtable.com/v0/${AIRTABLE_ACTIVITY_LOG_BASE_ID}/${AIRTABLE_ACTIVITY_LOG_TABLE_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_ACTIVITY_LOG_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Logs fetched successfully');
    return response.data.records;
  } catch (error) {
    console.error('Error fetching activity logs:', error.response ? error.response.data : error.message);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    throw new Error('Failed to fetch activity logs');
  }
};

module.exports = { createActivityLog, fetchAllLogs };
