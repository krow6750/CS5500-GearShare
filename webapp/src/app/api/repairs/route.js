import { NextResponse } from 'next/server';
import { firebaseDB } from '@/lib/firebase/db';
import { COLLECTIONS } from '@/lib/firebase/models';

export async function POST(request) {
  try {
    const data = await request.json();
    const repairId = await firebaseDB.create(COLLECTIONS.REPAIRS, data);
    return NextResponse.json({ id: repairId, ...data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const repairs = await firebaseDB.query(COLLECTIONS.REPAIRS);
    return NextResponse.json(repairs);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 