import { NextResponse } from 'next/server';
import { airtableService } from '@/lib/airtable/airtableService';

export async function GET() {
  try {
    const equipment = await airtableService.getEquipment();
    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Failed to get equipment:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 