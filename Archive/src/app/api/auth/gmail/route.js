import { google } from 'googleapis';
import { NextResponse } from 'next/server';

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

export async function GET(request) {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.send']
  });

  return NextResponse.redirect(url);
}

export async function POST(request) {
  const { code } = await request.json();
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    return NextResponse.json({ refresh_token: tokens.refresh_token });
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 