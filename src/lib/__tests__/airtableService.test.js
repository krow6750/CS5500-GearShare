import { airtableService } from '../airtable/airtableService';
import 'dotenv/config';

describe('airtableService', () => {
  test('createRepairTicket', async () => {
    const repairData = {
      'First Name': 'test',
      'Last Name': 'test',
      'Status': 'New Created',
      'Item Type': 'Jacket',
      'Damage or Defect': 'Test damage'
    };

    const result = await airtableService.createRepairTicket(repairData);
    expect(result).toBeTruthy();
    expect(result.id).toBeTruthy();
    console.log(`Created repair ticket with ID: ${result.id}`);
  });

  test('findRepairByTicketId', async () => {
    const result = await airtableService.findRepairByTicketId('TEST001');
    expect(result).toBeTruthy();
    expect(result.id).toBe('TEST001');
    console.log(`Found repair ticket: ${JSON.stringify(result)}`);
  });

  test('updateRepairTicket', async () => {
    const updatedData = {
      'Status': 'Finished, Customer Contacted',
      'Internal Notes': 'Test update'
    };

    const result = await airtableService.updateRepairTicket('TEST001', updatedData);
    expect(result).toBeTruthy();
    expect(result.id).toBe('TEST001');
    expect(result.fields['Status']).toBe('Finished, Customer Contacted');
    console.log(`Updated repair ticket: ${JSON.stringify(result)}`);
  });

});