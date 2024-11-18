import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD
  },
  debug: true
});

export async function GET() {
  try {
    console.log('Testing email with config:', {
      email: process.env.GMAIL_EMAIL?.slice(0, 3) + '...',
      hasPassword: !!process.env.GMAIL_APP_PASSWORD
    });

    // Verify configuration
    await transporter.verify();
    console.log('Email configuration verified');

    // Send test email
    const info = await transporter.sendMail({
      from: `"Gear Share Test" <${process.env.GMAIL_EMAIL}>`,
      to: process.env.GMAIL_EMAIL, // Send to yourself
      subject: "Test Email from Gear Share",
      html: `
        <h1>Test Email</h1>
        <p>This is a test email from Gear Share sent at ${new Date().toLocaleString()}</p>
        <p>If you received this, the email service is working correctly!</p>
      `
    });

    console.log('Test email sent:', info.messageId);

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      sentTo: process.env.GMAIL_EMAIL?.slice(0, 3) + '...'
    });

  } catch (error) {
    console.error('Test email failed:', {
      name: error.name,
      message: error.message,
      code: error.code,
      command: error.command
    });

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 