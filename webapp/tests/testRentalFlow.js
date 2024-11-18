const BOOQABLE_API_KEY = '8510333fd37ea857663fab05c399aaa44f451efa3fc2a83a237720bc919b599f';
const BOOQABLE_BASE_URL = 'https://gear-share.booqable.com/api/1';

async function testCompleteRentalFlow() {
  try {
    // 1. Verify connection
    console.log('\n1. Verifying Booqable connection...');
    const testResponse = await fetch(`${BOOQABLE_BASE_URL}/products`, {
      headers: {
        'Authorization': `Bearer ${BOOQABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!testResponse.ok) {
      throw new Error(`Failed to connect to Booqable: ${await testResponse.text()}`);
    }

    const products = await testResponse.json();
    console.log('Connected to Booqable successfully. Found', products.products.length, 'products');

    // 2. Create order
    console.log('\n2. Creating new order...');
    const orderResponse = await fetch(`${BOOQABLE_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BOOQABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order: {
          starts_at: new Date().toISOString(),
          stops_at: new Date(Date.now() + 86400000).toISOString(),
          customer: {
            name: 'Test Customer',
            email: 'test@example.com'
          }
        }
      })
    });

    const order = await orderResponse.json();
    console.log('Created order:', order.order.id);

    // 3. Add bench press
    console.log('\n3. Adding bench press to order...');
    const productId = 'ee8ae084-5dea-4427-9428-aaab876b2817';
    const lineResponse = await fetch(`${BOOQABLE_BASE_URL}/orders/${order.order.id}/lines`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BOOQABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        line: {
          product_id: productId,
          quantity: 1
        }
      })
    });

    const lineResult = await lineResponse.json();
    console.log('Added line item to order');

    // 4. Check final order status
    console.log('\n4. Checking final order status...');
    const finalResponse = await fetch(`${BOOQABLE_BASE_URL}/orders/${order.order.id}`, {
      headers: {
        'Authorization': `Bearer ${BOOQABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const finalOrder = await finalResponse.json();
    console.log('Final order status:', finalOrder.order.status);

    // 5. Start the order (change status to reserved)
    console.log('\n5. Starting the order...');
    const startResponse = await fetch(`${BOOQABLE_BASE_URL}/orders/${order.order.id}/reserve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BOOQABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const startedOrder = await startResponse.json();
    console.log('Order status after start:', startedOrder.order.status);

    return {
      success: true,
      orderId: order.order.id,
      initialStatus: finalOrder.order.status,
      finalStatus: startedOrder.order.status
    };

  } catch (error) {
    console.error('Test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
console.log('Starting Booqable order test...');
testCompleteRentalFlow()
  .then(result => {
    console.log('\nTest result:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('\nTest failed:', error);
    process.exit(1);
  });