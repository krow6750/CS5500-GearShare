import { NextResponse } from 'next/server';
import { firebaseDB } from '@/lib/firebase/db';
import { COLLECTIONS } from '@/lib/firebase/models';
import { booqableService } from '@/lib/booqable/booqableService';
import { logActivity } from '@/lib/utils/activityLogger';

export async function POST(request) {
  try {
    const rentalData = await request.json();
    console.log('1. Received rental data:', rentalData);

    // 1. Validate input
    if (!rentalData.equipment_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing equipment_id' 
      }, { status: 400 });
    }

    // 2. Get equipment details
    let equipment;
    try {
      equipment = await firebaseDB.get(COLLECTIONS.EQUIPMENT, rentalData.equipment_id);
      console.log('2. Found equipment:', equipment);
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch equipment',
        details: dbError.message 
      }, { status: 500 });
    }

    if (!equipment) {
      return NextResponse.json({ 
        success: false, 
        error: `Equipment not found: ${rentalData.equipment_id}` 
      }, { status: 404 });
    }

    if (!equipment.booqableId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Equipment not synced with Booqable' 
      }, { status: 400 });
    }

    // 3. Create in Booqable
    let booqableResponse;
    try {
      console.log('3. Creating Booqable order for equipment:', equipment.booqableId);
      booqableResponse = await booqableService.createRental({
        start_date: rentalData.start_date,
        end_date: rentalData.end_date,
        equipment_booqable_id: equipment.booqableId,
        customer_name: rentalData.customer_name,
        customer_email: rentalData.customer_email,
        quantity: rentalData.quantity,
        price: equipment.price
      });
      console.log('4. Booqable response:', booqableResponse);
    } catch (booqableError) {
      console.error('Booqable error:', booqableError);
      return NextResponse.json({ 
        success: false, 
        error: 'Booqable order creation failed',
        details: booqableError.message 
      }, { status: 500 });
    }

    // 4. Create in your system
    try {
      const rental = {
        ...rentalData,
        rental_id: Date.now(),
        booqable_order_id: booqableResponse?.order?.id,
        created_at: new Date().toISOString(),
        status: 'reserved',
        total_cost: rentalData.price * (rentalData.quantity || 1)
      };

      const rentalId = await firebaseDB.create(COLLECTIONS.RENTALS, rental);
      console.log('5. Created rental in system:', rental);

      // Add debug logs
      console.log('Attempting to log rental creation activity...');
      
      const logDetails = {
        rental_id: rental.rental_id,
        equipment_id: equipment.id,
        equipment_name: equipment.name,
        customer_name: rentalData.customer_name,
        customer_email: rentalData.customer_email,
        start_date: rentalData.start_date,
        end_date: rentalData.end_date,
        total_cost: rental.total_cost,
        status: rental.status,
        booqable_order_id: rental.booqable_order_id,
        created_at: rental.created_at
      };

      console.log('Log details prepared:', logDetails);

      try {
        await logActivity({
          action_type: 'create',
          collection: 'rentals',
          description: `Created rental for ${equipment.name}`,
          details: logDetails
        });
        console.log('Successfully logged rental creation activity');
      } catch (logError) {
        console.error('Failed to log rental creation:', logError);
        // Continue with the rental creation even if logging fails
      }

      return NextResponse.json({
        success: true,
        id: rentalId,
        ...rental
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create rental in database',
        details: dbError.message 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Unexpected error occurred',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, status, ...updateData } = await request.json();
    
    const rental = await firebaseDB.get(COLLECTIONS.RENTALS, id);
    if (!rental) {
      throw new Error('Rental not found');
    }

    const booqableStatus = {
      'pending': 'new',
      'confirmed': 'reserved',
      'active': 'started',
      'completed': 'stopped',
      'cancelled': 'cancelled'
    }[status];

    if (rental.booqable_order_id && booqableStatus) {
      await booqableService.updateRentalStatus(rental.booqable_order_id, booqableStatus);
    }

    const updatePayload = { 
      status,
      booqable_status: booqableStatus,
      last_updated: new Date().toISOString(),
      ...updateData 
    };

    await firebaseDB.update(COLLECTIONS.RENTALS, id, updatePayload);

    // Add logging for status updates
    await logActivity({
      action_type: 'update',
      collection: 'rentals',
      description: `Updated rental status to ${status}`,
      details: {
        rental_id: rental.rental_id,
        previous_status: rental.status,
        new_status: status,
        equipment_name: rental.equipment_name,
        customer_name: rental.customer_name,
        updated_at: updatePayload.last_updated
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const rentals = await firebaseDB.query(COLLECTIONS.RENTALS);
    return NextResponse.json(rentals);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 