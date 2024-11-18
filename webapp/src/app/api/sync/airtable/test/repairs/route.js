import { NextResponse } from 'next/server';
import { airtableService } from '@/lib/airtable/airtableService';

export async function GET() {
  try {
    const repairs = await airtableService.getRepairTickets();
    return NextResponse.json(repairs);
  } catch (error) {
    console.error('Failed to get repairs:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 