const BOOQABLE_API_KEY = '8510333fd37ea857663fab05c399aaa44f451efa3fc2a83a237720bc919b599f';
const BOOQABLE_BASE_URL = 'https://gear-share.booqable.com/api/1';
const API_BASE = 'http://localhost:3001/api';

const log = {
  start: (msg) => console.log(`\n🏁 [${new Date().toISOString()}] ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg, error) => console.error(`❌ ${msg}:`, error),
  info: (msg) => console.log(`ℹ️ ${msg}`)
};

// Add helper function for API calls
async function callAPI(endpoint, method = 'GET', data = null) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        // Add any auth headers if needed
      },
      ...(data && { body: JSON.stringify(data) })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API call failed: ${response.statusText} ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    log.error(`API call to ${endpoint} failed`, error);
    throw error;
  }
}

async function testBooqableIntegration() {
  try {
    // 1. Test Connection
    log.start("Testing Booqable Connection");
    const connectionTest = await fetch(`${BOOQABLE_BASE_URL}/products`, {
      headers: {
        'Authorization': `Bearer ${BOOQABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    if (!connectionTest.ok) throw new Error("Connection failed");
    log.success("Connection successful");

    // 2. Test Equipment Creation
    log.start("Testing Equipment Creation");
    const equipmentData = {
      name: `Test Equipment ${Date.now()}`,
      equipment_category: "Test Category",
      status: "available",
      price: 99.99,
      description: "Test description",
      quantity: 1
    };
    
    const equipment = await callAPI('/equipment', 'POST', equipmentData);
    if (!equipment.booqableId) throw new Error("Equipment creation failed");
    log.success(`Equipment created with Booqable ID: ${equipment.booqableId}`);

    // 3. Test Rental Creation
    log.start("Testing Rental Creation");
    const rentalData = {
      equipment_id: equipment.id,
      equipment_booqable_id: equipment.booqableId,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 86400000).toISOString(),
      customer: {
        name: "Test Customer",
        email: "test@example.com"
      },
      quantity: 1
    };

    const rental = await callAPI('/rentals', 'POST', rentalData);
    if (!rental.booqable_order_id) throw new Error("Rental creation failed");
    log.success(`Rental created with Booqable Order ID: ${rental.booqable_order_id}`);

    // 4. Test Status Updates
    log.start("Testing Status Updates");
    const statuses = ['confirmed', 'active', 'completed'];
    for (const status of statuses) {
      const result = await callAPI('/rentals', 'PUT', {
        id: rental.id,
        status: status
      });
      if (!result.success) throw new Error(`Status update to ${status} failed`);
      log.success(`Status updated to ${status}`);
      
      // Wait for sync
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // 5. Test Sync
    log.start("Testing Sync Function");
    const syncResult = await callAPI('/rentals/sync', 'POST');
    if (!syncResult.success) throw new Error("Sync failed");
    log.success("Sync completed successfully");

    // 6. Verify Final State
    log.start("Verifying Final State");
    const finalRentalResponse = await fetch(`${BOOQABLE_BASE_URL}/orders/${rental.booqable_order_id}`, {
      headers: {
        'Authorization': `Bearer ${BOOQABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    const finalRental = await finalRentalResponse.json();
    log.success(`Final Booqable status: ${finalRental.order.status}`);

    return {
      success: true,
      details: {
        equipmentId: equipment.id,
        booqableEquipmentId: equipment.booqableId,
        rentalId: rental.id,
        booqableOrderId: rental.booqable_order_id,
        finalStatus: finalRental.order.status
      }
    };

  } catch (error) {
    log.error("Test failed", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
console.log('Starting Comprehensive Booqable Integration Test...');
testBooqableIntegration()
  .then(result => {
    console.log('\nTest Results:', result);
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('\nTest failed unexpectedly:', error);
    process.exit(1);
  });