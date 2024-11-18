import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD // Use an App Password, not your regular password
  }
});

export async function POST(request) {
  try {
    const { to, subject, html } = await request.json();

    // Validate inputs
    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send email
    const info = await transporter.sendMail({
      from: `"Gear Share" <${process.env.GMAIL_EMAIL}>`,
      to: to,
      subject: subject,
      html: html
    });

    console.log('Email sent successfully:', info.messageId);

    return NextResponse.json({
      success: true,
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Failed to send email:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 