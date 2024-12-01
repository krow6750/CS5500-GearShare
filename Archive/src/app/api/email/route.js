import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

export async function POST(request) {
  try {
    const { to, subject, html } = await request.json();

    console.log('Attempting to send email with:', {
      from: process.env.GMAIL_EMAIL,
      to,
      subject
    });

    const info = await transporter.sendMail({
      from: `"GearShare" <${process.env.GMAIL_EMAIL}>`,
      to,
      subject,
      html
    });

    console.log('Email sent successfully:', info.messageId);
    
    return NextResponse.json({
      success: true,
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Email sending failed:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 