const BOOQABLE_API_KEY = '8510333fd37ea857663fab05c399aaa44f451efa3fc2a83a237720bc919b599f';
const BOOQABLE_BASE_URL = 'https://gear-share.booqable.com/api/1';

async function checkSync() {
  try {
    // 1. Get current orders
    console.log('\n1. Getting current Booqable orders...');
    const ordersResponse = await fetch(`${BOOQABLE_BASE_URL}/orders`, {
      headers: {
        'Authorization': `Bearer ${BOOQABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const orders = await ordersResponse.json();
    console.log('Number of orders:', orders.orders.length);
    console.log('Order statuses:', orders.orders.map(o => ({ 
      id: o.id,
      status: o.status,
      customer: o.customer?.name
    })));

  } catch (error) {
    console.error('Error:', error);
  }
}

checkSync();