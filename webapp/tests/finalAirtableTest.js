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
    const equipment = [];
    const repairs = [];
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Create multiple equipment items
    const equipmentData = [
      {
        equipment_id: Date.now(),
        name: 'Sony A7SIII Camera',
        equipment_category: 'Cameras',
        status: 'available',
        price: 2499.99
      },
      {
        equipment_id: Date.now() + 1,
        name: 'Canon 70-200mm f/2.8',
        equipment_category: 'Lenses',
        status: 'in_repair',
        price: 1899.99
      },
      {
        equipment_id: Date.now() + 2,
        name: 'Aputure 600D Pro',
        equipment_category: 'Lighting',
        status: 'rented',
        price: 1699.99
      },
      {
        equipment_id: Date.now() + 3,
        name: 'Rode NTG5 Kit',
        equipment_category: 'Audio',
        status: 'available',
        price: 499.99
      }
    ];

    for (const data of equipmentData) {
      const response = await apiCall('/equipment', 'POST', data);
      equipment.push(response);
      log.success(`Created equipment: ${data.name}`);
    }

    // Create multiple repairs
    const repairData = [
      {
        repair_ticket_id: Date.now(),
        equipment_type: 'Camera',
        reported_by: 1,
        issue_description: 'Sensor cleaning needed',
        start_date: today.toISOString().split('T')[0],
        status: 'pending',
        cost: 150.00
      },
      {
        repair_ticket_id: Date.now() + 1,
        equipment_type: 'Lens',
        reported_by: 2,
        issue_description: 'Focus ring stuck',
        start_date: today.toISOString().split('T')[0],
        end_date: tomorrow.toISOString().split('T')[0],
        status: 'completed',
        cost: 299.99
      },
      {
        repair_ticket_id: Date.now() + 2,
        equipment_type: 'Lighting',
        reported_by: 1,
        issue_description: 'Power supply issue',
        start_date: today.toISOString().split('T')[0],
        status: 'in_progress',
        cost: 89.99
      }
    ];

    for (const data of repairData) {
      const response = await apiCall('/repairs', 'POST', data);
      repairs.push(response);
      log.success(`Created repair ticket: #${data.repair_ticket_id}`);
    }

    return { equipment, repairs };
  } catch (error) {
    log.error('Failed to create test data', error);
    throw error;
  }
}

async function verifySync(testData) {
  try {
    // Get all equipment from Airtable
    const equipmentResponse = await apiCall('/sync/airtable/test/equipment');
    log.info('Airtable equipment count:', equipmentResponse.records?.length);

    // Get all repairs from Airtable
    const repairsResponse = await apiCall('/sync/airtable/test/repairs');
    log.info('Airtable repairs count:', repairsResponse.records?.length);

    // Check if our test data exists in Airtable responses
    const equipmentSynced = testData.equipment.every(item =>
      equipmentResponse.records?.some(record => record.fields.firebase_id === item.id)
    );

    const repairsSynced = testData.repairs.every(item =>
      repairsResponse.records?.some(record => record.fields.firebase_id === item.id)
    );

    log.info('Equipment sync status:', equipmentSynced ? 'All Synced ✅' : 'Some Missing ❌');
    log.info('Repair sync status:', repairsSynced ? 'All Synced ✅' : 'Some Missing ❌');

    return { equipmentSynced, repairsSynced };
  } catch (error) {
    log.error('Failed to verify sync', error);
    throw error;
  }
}

async function finalTest() {
  try {
    log.start('Final Airtable Sync Test');

    // Create test data
    log.info('Creating test data...');
    const testData = await createTestData();
    log.info(`Created ${testData.equipment.length} equipment items and ${testData.repairs.length} repair tickets`);

    // Run sync
    log.info('Running full sync...');
    const syncResult = await apiCall('/sync/airtable/sync', 'POST', {});
    log.info('Sync completed:', syncResult);

    // Wait a bit for Airtable to process
    log.info('Waiting for sync to settle...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify sync results
    log.info('Verifying sync results...');
    const verification = await verifySync(testData);

    if (verification.equipmentSynced && verification.repairsSynced) {
      log.success('🎉 Final test completed successfully! All items synced correctly.');
    } else {
      log.error('Final test completed with sync issues', verification);
    }

  } catch (error) {
    log.error('Final test failed', error);
  }
}

finalTest();