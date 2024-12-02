// testFetchAllRepairTickets.js
const { airtableService } = require('./airtableService');

async function testFetchAllRepairTickets() {
  try {
    console.log('Testing fetchAllRepairTickets...');
    const repairTickets = await airtableService.fetchAllRepairTickets();
    console.log('Raw Airtable API Response:', repairTickets);
  } catch (error) {
    console.error('Error fetching repair tickets:', error);
  }
}

testFetchAllRepairTickets();