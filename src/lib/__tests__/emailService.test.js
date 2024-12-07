import { emailServices } from '../email/emailService';

describe('emailServices', () => {
  test('test', async () => {
    const result = await emailServices.sendEmail({
      templateName: 'test',
      recipients: 'gearshare28@gmail.com',
      firstName: 'test',
      lastName: 'test',
      finalPrice: 'test',
      repairId: 'test',
      itemType: 'test',
      paymentType: 'test',
      status: 'test',
      notes: 'test'
    });

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.type).toBe('emails');
  });
});