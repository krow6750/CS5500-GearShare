import { NextResponse } from 'next/server';
import { airtableService } from '@/lib/airtable/airtableService';

export async function GET() {
  try {
    const repairs = await airtableService.fetchAllRepairTickets();
    return NextResponse.json({
      success: true,
      data: repairs
    });
  } catch (error) {
    console.error('Failed to get repairs:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 