import { NextResponse } from 'next/server';
import { repairService } from '@/lib/services/repairService';

export async function POST(request) {
  try {
    const data = await request.json();
    const repair = await repairService.createRepair(data);
    return NextResponse.json({
      id: repair.id,
      createdTime: repair.createdTime,
      fields: repair.fields
    });
  } catch (error) {
    console.error('Create repair failed:', error);
    return NextResponse.json(
      { error: error.message }, 
      { status: error.statusCode || 500 }
    );
  }
}

export async function GET() {
  try {
    const repairs = await repairService.getAllRepairs();
    return NextResponse.json(repairs.map(repair => ({
      id: repair.id,
      createdTime: repair.createdTime,
      fields: repair.fields
    })));
  } catch (error) {
    console.error('Get repairs failed:', error);
    return NextResponse.json(
      { 
        error: error.message,
        name: error.name,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, 
      { status: error.statusCode || 500 }
    );
  }
} 