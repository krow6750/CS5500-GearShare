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
  const today = new Date();
  const testData = [
    {
      'Repair ID': Date.now(),
      'First Name': 'John',
      'Last Name': 'Doe',
      'Internal Notes': 'Test repair 1',
      'Item Type': STATUS.ITEM_TYPE.CAMERA,
      'Price Quote': 150.00,
      'Final Price': 150.00,
      'Type of Item': 'Camera',
      'Damage or Defect': 'Sensor cleaning needed',
      'Payment type': STATUS.PAYMENTTYPE.CASH,
      'Brand': 'Sony',
      'Status': STATUS.STATUS.Dropped_Off_Awaiting_Repair,
      'Telephone': '(555) 123-4567',
      'Weight (Ounces)': 24,
      'Color': 'Black',
      'Photo/Attachment': [],
      'Referred By': 'Website',
      'Requestor Type': STATUS.REQUESTOR_TYPE.PAYING_CUSTOMER,
      'Date Quoted': today.toISOString().split('T')[0],
      'Owner': {
        id: 'recXXXXXXXXXXXXXX',
        email: 'john.doe@example.com',
        name: 'John Doe'
      },
      'Delivery of Item': "I'll drop it off at Maine GearShare",
      'Email': 'john.doe@example.com',
      'Autonumber': 1,
      'Amount Paid': 0
    }
  ];

  return testData;
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
    const equipmentSynced = testData.every(item =>
      equipmentResponse.records?.some(record => record.fields.firebase_id === item.id)
    );

    const repairsSynced = testData.every(item =>
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
    log.info(`Created ${testData.length} repair tickets`);

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