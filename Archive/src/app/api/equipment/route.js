import { NextResponse } from 'next/server';
import { firebaseDB } from '@/lib/firebase/db';
import { COLLECTIONS } from '@/lib/firebase/models';
import { booqableService } from '@/lib/booqable/booqableService';
import { airtableService } from '@/lib/airtable/airtableService';
import { equipmentService } from '@/lib/services/equipmentService';

export async function POST(request) {
  try {
    const equipmentData = await request.json();
    
    // Use the equipmentService instead of direct calls
    const result = await equipmentService.createEquipment(equipmentData);
    
    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Equipment creation failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const equipment = await firebaseDB.query(COLLECTIONS.EQUIPMENT);
    const availableEquipment = equipment.filter(item => item.status === 'available');
    return NextResponse.json(availableEquipment);
  } catch (error) {
    console.error('Failed to get equipment:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}