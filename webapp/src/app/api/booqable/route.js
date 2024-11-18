import { NextResponse } from 'next/server';
import { booqableService } from '@/lib/booqable/booqableService';

export async function POST(request) {
  try {
    const { operation, data } = await request.json();

    switch (operation) {
      case 'createRental':
        const result = await booqableService.createRental(data);
        console.log('Booqable API Response:', result);
        return NextResponse.json(result);

      case 'updateRental':
        const updateResult = await booqableService.updateRental(data);
        return NextResponse.json(updateResult);

      case 'getRental':
        const rental = await booqableService.getRental(data.id);
        return NextResponse.json(rental);

      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Booqable API error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 