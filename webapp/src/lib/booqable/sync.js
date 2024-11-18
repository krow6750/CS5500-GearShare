import { db } from '../firebase/firebase-config';
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

const BOOQABLE_API_KEY = '8510333fd37ea857663fab05c399aaa44f451efa3fc2a83a237720bc919b599f';
const BOOQABLE_BASE_URL = 'https://gear-share.booqable.com/api/1';

function mapBooqableStatus(booqableStatus) {
  const statusMap = {
    'new': 'pending',
    'concept': 'pending',
    'reserved': 'confirmed',
    'started': 'active',
    'stopped': 'completed'
  };
  return statusMap[booqableStatus] || booqableStatus;
}

export async function syncBooqableOrders() {
  try {
    console.log('Starting Booqable sync...');

    const rentalsRef = collection(db, 'rentals');
    const q = query(rentalsRef, 
      where('status', 'in', ['pending', 'confirmed', 'active'])
    );
    
    const querySnapshot = await getDocs(q);
    const updates = [];

    for (const doc of querySnapshot.docs) {
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          const rental = doc.data();
          if (!rental.booqable_order_id) continue;

          const response = await fetch(
            `${BOOQABLE_BASE_URL}/orders/${rental.booqable_order_id}`,
            {
              headers: {
                'Authorization': `Bearer ${BOOQABLE_API_KEY}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.ok) {
            if (response.status === 429) { // Rate limit
              await new Promise(resolve => setTimeout(resolve, 1000));
              retryCount++;
              continue;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const booqableData = await response.json();
          
          if (booqableData.order.status !== rental.booqable_status) {
            updates.push(updateDoc(doc.ref, {
              booqable_status: booqableData.order.status,
              status: mapBooqableStatus(booqableData.order.status),
              last_synced: new Date().toISOString(),
              sync_error: null // Clear any previous errors
            }));
          }
          break; // Success, exit retry loop
          
        } catch (error) {
          if (retryCount === maxRetries - 1) {
            updates.push(updateDoc(doc.ref, {
              sync_error: error.message,
              last_sync_attempt: new Date().toISOString()
            }));
          }
          retryCount++;
        }
      }
    }

    if (updates.length > 0) {
      await Promise.all(updates);
    }

    return true;
  } catch (error) {
    console.error('Sync failed:', error);
    return false;
  }
} 