import { syncService } from '@/lib/sync/syncService';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();
    await syncService.logActivity(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 