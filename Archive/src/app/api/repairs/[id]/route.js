import { NextResponse } from 'next/server';
import { repairService } from '@/lib/services/repairService';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const repair = await repairService.getRepair(id);
    return NextResponse.json({
      id: repair.id,
      createdTime: repair.createdTime,
      fields: repair.fields
    });
  } catch (error) {
    console.error('Get repair failed:', error);
    return NextResponse.json(
      { 
        error: error.message,
        details: error.stack,
        name: error.name
      }, 
      { status: error.statusCode || 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    const updated = await repairService.updateRepair(id, data);
    return NextResponse.json({
      id: updated.id,
      createdTime: updated.createdTime,
      fields: updated.fields
    });
  } catch (error) {
    console.error('Update repair failed:', error);
    return NextResponse.json(
      { 
        error: error.message,
        details: error.stack,
        name: error.name
      }, 
      { status: error.statusCode || 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await repairService.deleteRepair(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete repair failed:', error);
    return NextResponse.json(
      { 
        error: error.message,
        details: error.stack,
        name: error.name
      }, 
      { status: error.statusCode || 500 }
    );
  }
} 