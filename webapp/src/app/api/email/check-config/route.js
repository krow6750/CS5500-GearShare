import { NextResponse } from 'next/server';

export async function GET() {
  const isConfigured = 
    !!process.env.SENDGRID_API_KEY && 
    !!process.env.SENDGRID_VERIFIED_SENDER;

  return NextResponse.json({ 
    isConfigured,
    missingKeys: {
      apiKey: !process.env.SENDGRID_API_KEY,
      sender: !process.env.SENDGRID_VERIFIED_SENDER
    }
  });
} 