import { NextResponse } from 'next/server';
import { firebaseDB } from '@/lib/firebase/db';
import { COLLECTIONS } from '@/lib/firebase/models';

export async function GET() {
  try {
    const equipment = await firebaseDB.query(COLLECTIONS.EQUIPMENT);
    return NextResponse.json({
      success: true,
      count: equipment.length,
      equipment: equipment
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 