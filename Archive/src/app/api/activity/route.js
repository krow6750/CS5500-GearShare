import { NextResponse } from 'next/server';
import { firebaseDB } from '@/lib/firebase/db';
import { COLLECTIONS } from '@/lib/firebase/models';

export async function GET() {
  try {
    const logs = await firebaseDB.query(COLLECTIONS.ACTIVITY_LOGS);
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 