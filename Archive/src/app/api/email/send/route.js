import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid only on server side
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function POST(request) {
  try {
    const { to, subject, html } = await request.json();

    if (!process.env.SENDGRID_API_KEY) {
      console.warn('SendGrid API key not set');
      return NextResponse.json(
        { message: 'Email service not configured' },
        { status: 503 }
      );
    }

    const msg = {
      to,
      from: process.env.SENDGRID_VERIFIED_SENDER,
      subject,
      html
    };

    await sgMail.send(msg);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
} 