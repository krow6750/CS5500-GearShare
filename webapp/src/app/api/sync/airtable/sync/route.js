import { NextResponse } from 'next/server';
import { airtableSync } from '@/lib/sync/airtableSync';

export async function POST(request) {
  try {
    const { type } = await request.json();
    
    if (type === 'repairs') {
      await airtableSync.syncRepairs();
    } else if (type === 'equipment') {
      await airtableSync.syncEquipment();
    } else {
      // Sync both
      await Promise.all([
        airtableSync.syncRepairs(),
        airtableSync.syncEquipment()
      ]);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Sync completed successfully'
    });
  } catch (error) {
    console.error('Sync failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 