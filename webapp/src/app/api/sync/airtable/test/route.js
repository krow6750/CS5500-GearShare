import { NextResponse } from 'next/server';
import { airtableService } from '@/lib/airtable/airtableService';

export async function GET() {
  try {
    console.log('Testing Airtable connection...');
    console.log('API Key:', process.env.NEXT_PUBLIC_AIRTABLE_API_KEY?.slice(0, 10) + '...');
    console.log('Base ID:', process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID);
    
    const isConnected = await airtableService.testConnection();
    
    return NextResponse.json({
      success: true,
      connected: isConnected,
      baseId: process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID,
      message: isConnected ? 'Successfully connected to Airtable' : 'Failed to connect to Airtable'
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 