import { emailService } from '../lib/email/emailService.js';
import dotenv from 'dotenv';

dotenv.config();

async function testEmailService() {
  try {
    console.log('🔍 Testing email service...');

    // Test basic email
    await emailService.sendEmail(
      process.env.GMAIL_EMAIL,
      'Test Email from GearShare',
      '<h1>Test Successful!</h1><p>Email service is working! 🎉</p>'
    );

    // Test repair notification
    await emailService.sendRepairUpdate(
      {
        repair_ticket_id: 'TEST-001',
        status: 'in_progress',
        equipment_type: 'Camera'
      },
      process.env.GMAIL_EMAIL
    );

    console.log('✅ All email tests completed successfully!');
  } catch (error) {
    console.error('❌ Email test failed:', error);
  }
}

testEmailService(); 