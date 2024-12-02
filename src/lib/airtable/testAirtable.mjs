import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { airtableService } from './airtableService.js';

// Get the directory path of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: join(__dirname, '../../../.env') });

async function testFetchAllRepairTickets() {
  try {
    console.log('Environment variables loaded:');
    console.log('AIRTABLE_API_KEY:', process.env.AIRTABLE_API_KEY ? 'Set' : 'Not set');
    console.log('AIRTABLE_BASE_ID:', process.env.AIRTABLE_BASE_ID ? 'Set' : 'Not set');
    
    console.log('\nTesting fetchAllRepairTickets...');
    const repairTickets = await airtableService.fetchAllRepairTickets();
    console.log('\nRaw Airtable API Response:', JSON.stringify(repairTickets, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    if (error.stack) console.error('Stack:', error.stack);
  }
}

testFetchAllRepairTickets(); 