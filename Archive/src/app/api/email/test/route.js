import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET() {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    // Log configuration
    console.log('Testing email with config:', {
      email: process.env.GMAIL_EMAIL,
      hasPassword: !!process.env.GMAIL_APP_PASSWORD
    });

    // Verify configuration
    await transporter.verify();
    console.log('Email configuration verified');

    // Send test email
    const info = await transporter.sendMail({
      from: `"GearShare Test" <${process.env.GMAIL_EMAIL}>`,
      to: process.env.GMAIL_EMAIL,
      subject: "Test Email from GearShare",
      html: "<h1>Test Email</h1><p>If you received this, the email service is working!</p>"
    });

    return NextResponse.json({
      success: true,
      messageId: info.messageId
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