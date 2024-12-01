import dotenv from 'dotenv';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';

dotenv.config();

async function testGmailSetup() {
  try {
    console.log('🔍 Testing Gmail configuration...');

    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      process.env.GMAIL_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN
    });

    const accessToken = await oauth2Client.getAccessToken();
    console.log('✅ Access token obtained');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_EMAIL,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken.token
      }
    });

    console.log('📧 Sending test email...');
    
    await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to: process.env.GMAIL_EMAIL,
      subject: 'GearShare Gmail Test',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>Gmail Integration Test</h1>
          <p>If you're seeing this email, your Gmail integration is working perfectly! 🎉</p>
          <p>Test completed at: ${new Date().toLocaleString()}</p>
        </div>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log('✅ Gmail configuration is working properly');
    
  } catch (error) {
    console.error('❌ Gmail test failed:', error);
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack
    });
  }
}

testGmailSetup(); 