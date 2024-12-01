import { NextResponse } from 'next/server';
import { firebaseDB } from '@/lib/firebase/db';
import { COLLECTIONS } from '@/lib/firebase/models';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const rental = await firebaseDB.get(COLLECTIONS.RENTALS, id);
    return NextResponse.json(rental);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    await firebaseDB.update(COLLECTIONS.RENTALS, id, data);
    return NextResponse.json({ id, ...data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await firebaseDB.delete(COLLECTIONS.RENTALS, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 