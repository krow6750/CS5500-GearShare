import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, updateDoc, collection } from 'firebase/firestore';
import { google } from 'googleapis';

// Load environment variables
dotenv.config();

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Gmail setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

const STATUS = {
  REPAIR: {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed'
  }
};

async function sendEmail(to, subject, html) {
  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `From: GearShare <${process.env.GMAIL_EMAIL}>`,
      `To: ${to}`,
      `Subject: ${utf8Subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      html
    ];
    const message = messageParts.join('\n');
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

async function testRepairEmails() {
  try {
    console.log('🔍 Starting repair email tests...');

    // Test 1: Status Update Email
    console.log('\n📧 Test 1: Sending status update email...');
    const testRepair = {
      repair_ticket_id: 'TEST-001',
      status: STATUS.REPAIR.IN_PROGRESS,
      equipment_type: 'Camera',
      notes: 'Testing repair status update email',
    };
    
    await sendEmail(
      process.env.TEST_EMAIL || process.env.GMAIL_EMAIL,
      `Repair Status Update #${testRepair.repair_ticket_id}`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Repair Status Update</h1>
          <p>Your repair ticket has been updated to: <strong>${testRepair.status}</strong></p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
            <h2 style="margin-top: 0;">Repair Details:</h2>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Ticket ID:</strong> ${testRepair.repair_ticket_id}</li>
              <li><strong>Status:</strong> ${testRepair.status}</li>
              <li><strong>Equipment:</strong> ${testRepair.equipment_type}</li>
              <li><strong>Notes:</strong> ${testRepair.notes}</li>
            </ul>
          </div>
        </div>
      `
    );
    console.log('✅ Status update email sent successfully');

    // Test 2: Completion Email
    console.log('\n📧 Test 2: Sending completion email...');
    const completedRepair = {
      repair_ticket_id: 'TEST-002',
      status: STATUS.REPAIR.COMPLETED,
      equipment_type: 'Tripod',
      notes: 'Testing repair completion email',
      completion_date: new Date().toISOString()
    };
    
    await sendEmail(
      process.env.TEST_EMAIL || process.env.GMAIL_EMAIL,
      `Your Repair is Complete - Ready for Pickup #${completedRepair.repair_ticket_id}`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Repair Complete!</h1>
          <p>Great news! Your equipment repair has been completed and is ready for pickup.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
            <h2 style="margin-top: 0;">Repair Summary:</h2>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Ticket ID:</strong> ${completedRepair.repair_ticket_id}</li>
              <li><strong>Equipment:</strong> ${completedRepair.equipment_type}</li>
              <li><strong>Completion Date:</strong> ${new Date(completedRepair.completion_date).toLocaleDateString()}</li>
              <li><strong>Notes:</strong> ${completedRepair.notes}</li>
            </ul>
            <div style="margin-top: 20px; padding: 15px; background: #dcfce7; border-radius: 6px;">
              <p style="margin: 0;"><strong>Next Steps:</strong></p>
              <p style="margin-top: 10px;">Please visit our location during business hours to collect your equipment.</p>
            </div>
          </div>
        </div>
      `
    );
    console.log('✅ Completion email sent successfully');

    console.log('\n✨ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit();
  }
}

// Run tests
testRepairEmails(); 