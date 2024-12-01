import { NextResponse } from 'next/server';
import { emailService } from '@/lib/email/emailService';

export async function GET() {
  try {
    console.log('Testing email configuration...');
    console.log('GMAIL_EMAIL:', process.env.GMAIL_EMAIL ? 'Set' : 'Not set');
    console.log('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? 'Set' : 'Not set');
    
    return Response.json({ 
      status: 'ok',
      config: {
        email: !!process.env.GMAIL_EMAIL,
        password: !!process.env.GMAIL_APP_PASSWORD
      }
    });
  } catch (error) {
    return Response.json({ 
      status: 'error',
      message: error.message 
    }, { status: 500 });
  }
} 