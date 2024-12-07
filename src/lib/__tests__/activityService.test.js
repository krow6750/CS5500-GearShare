import { activityService } from '../activity/activityService';
import 'dotenv/config';

describe('activityService', () => {
  test('createActivityLog', async () => {
    const result = await activityService.createActivityLog('create', 'Test description', 'test');
    expect(result).toBeDefined();
    expect(result.fields.actionType).toBe('Test description');
    expect(result.fields.collection).toBe('test');
  });

  test('fetchAllActivityLogs', async () => {
    const result = await activityService.fetchAllActivityLogs();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  test('logActivity', async () => {
    const result = await activityService.logActivity('test', 'create', { name: 'Test Item' });
    expect(result).toBeDefined();
    expect(result.fields.actionType).toBe('create test');
  });

  test('logRepairActivity', async () => {
    const result = await activityService.logRepairActivity('create', { fields: { 'Repair ID': '123', 'First Name': 'John', 'Last Name': 'Doe' } });
    expect(result).toBeDefined();
    expect(result.fields.actionType).toBe('Repair ticket #123 created');
  });

  test('logRentalActivity', async () => {
    const result = await activityService.logRentalActivity('create', { customer: { name: 'John Doe' }, equipment: { name: 'Bike' } });
    expect(result).toBeDefined();
    expect(result.fields.actionType).toBe('create rental for John Doe - Bike');
  });

  test('logEquipmentActivity', async () => {
    const result = await activityService.logEquipmentActivity('update', { name: 'Bike' });
    expect(result).toBeDefined();
    expect(result.fields.actionType).toBe('update equipment: Bike');
  });
});