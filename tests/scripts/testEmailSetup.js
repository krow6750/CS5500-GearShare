import dotenv from 'dotenv';
import { emailService } from '../lib/email/emailService.js';

// Load environment variables
dotenv.config();

async function testEmailSetup() {
  try {
    console.log('🔍 Starting email service test...');
    console.log('Environment variables loaded:', {
      email: process.env.GMAIL_EMAIL,
      appPassword: process.env.GMAIL_APP_PASSWORD ? '✓ Present' : '✗ Missing'
    });

    // Verify connection first
    await emailService.verifyConnection();

    // Send test email
    console.log('📧 Sending test email...');
    await emailService.sendEmail(
      process.env.GMAIL_EMAIL,
      'GearShare Test Email',
      `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>Test Email</h1>
          <p>This is a test email sent at: ${new Date().toLocaleString()}</p>
        </div>
      `
    );

    console.log('✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Detailed error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      command: error.command
    });
  }
}

testEmailSetup(); 