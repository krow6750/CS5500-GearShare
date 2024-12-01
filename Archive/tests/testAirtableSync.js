const API_BASE = 'http://localhost:3001/api';

const log = {
  start: (msg) => console.log(`🏁 Starting ${msg}...`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg, error) => console.error(`❌ ${msg}:`, error),
  info: (msg) => console.log(`ℹ️ ${msg}`)
};

async function apiCall(endpoint, method = 'GET', data = null) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      ...(data && { body: JSON.stringify(data) })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API call failed (${response.status}): ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`API call to ${endpoint} failed: ${error.message}`);
  }
}

async function createTestData() {
  try {
    // Create test equipment with valid category
    const equipmentData = {
      equipment_id: Date.now(),
      name: `Test Camera ${Date.now()}`,
      equipment_category: 'Cameras',  // Using valid category from Airtable
      status: 'available',
      price: 999.99
    };

    const equipment = await apiCall('/equipment', 'POST', equipmentData);
    log.success('Test equipment created:', equipment);

    // Create test repair
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

    const repairData = {
      repair_ticket_id: Date.now(),
      equipment_type: 'Camera',
      reported_by: 1,
      issue_description: 'Test repair ticket',
      start_date: dateStr,
      status: 'pending',
      cost: 150.00
    };

    const repair = await apiCall('/repairs', 'POST', repairData);
    log.success('Test repair created:', repair);

    return { equipment, repair };
  } catch (error) {
    log.error('Failed to create test data', error);
    throw error;
  }
}

async function verifySync(testData) {
  try {
    // Get all equipment from Airtable
    const equipmentResponse = await apiCall('/sync/airtable/test/equipment');
    log.info('Airtable equipment:', equipmentResponse);

    // Get all repairs from Airtable
    const repairsResponse = await apiCall('/sync/airtable/test/repairs');
    log.info('Airtable repairs:', repairsResponse);

    // Check if our test data exists in Airtable responses
    const equipmentSynced = equipmentResponse.records?.some(
      record => record.fields.firebase_id === testData.equipment.id
    );
    const repairSynced = repairsResponse.records?.some(
      record => record.fields.firebase_id === testData.repair.id
    );

    log.info('Equipment sync status:', equipmentSynced ? 'Synced ✅' : 'Not synced ❌');
    log.info('Repair sync status:', repairSynced ? 'Synced ✅' : 'Not synced ❌');

    return { equipmentSynced, repairSynced };
  } catch (error) {
    log.error('Failed to verify sync', error);
    throw error;
  }
}

async function testSync() {
  try {
    log.start('Airtable Sync Test');

    // Create test data
    log.info('Creating test data...');
    const testData = await createTestData();

    // Test repairs sync
    log.info('Testing repairs sync...');
    const repairsResult = await apiCall('/sync/airtable/sync', 'POST', { type: 'repairs' });
    log.info('Repairs sync result:', repairsResult);

    // Test equipment sync
    log.info('Testing equipment sync...');
    const equipmentResult = await apiCall('/sync/airtable/sync', 'POST', { type: 'equipment' });
    log.info('Equipment sync result:', equipmentResult);

    // Verify sync results
    log.info('Verifying sync results...');
    await verifySync(testData);

    log.success('Sync test completed');
  } catch (error) {
    log.error('Sync test failed', error);
  }
}

testSync(); 