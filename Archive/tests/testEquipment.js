// Import necessary utilities
const API_BASE = 'http://localhost:3001/api';

const log = {
  start: (msg) => console.log(`🏁 [${new Date().toISOString()}] Starting ${msg}...`),
  success: (msg) => console.log(`✅ [${new Date().toISOString()}] ${msg}`),
  error: (msg, error) => console.error(`❌ [${new Date().toISOString()}] ${msg}:`, error),
  info: (msg) => console.log(`ℹ️ [${new Date().toISOString()}] ${msg}`)
};

const apiCall = async (endpoint, method = 'GET', data = null) => {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      ...(data && { body: JSON.stringify(data) })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API call failed: ${response.statusText} ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`API call to ${endpoint} failed: ${error.message}`);
  }
};

const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

// Main test function
const testEquipmentSync = async () => {
  log.start('Equipment-Booqable Sync Test');
  
  try {
    const equipmentData = {
      name: `Sony A7III Kit #${Date.now()}`,
      equipment_category: "Cameras",
      status: "available",
      price: 299.99,
      description: "Professional mirrorless camera with 28-70mm lens",
      quantity: 1
    };
    
    log.info('Creating equipment with data:', equipmentData);
    const response = await apiCall('/equipment', 'POST', equipmentData);
    log.info('API Response:', response);

    if (!response.success) {
      throw new Error(response.booqableError?.message || 'Equipment creation failed');
    }

    log.success(`Equipment created successfully with Booqable ID: ${response.booqableId}`);
    return {
      success: true,
      details: response
    };
  } catch (error) {
    log.error('Equipment-Booqable Sync Test Failed', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Run the test
console.log('Starting equipment sync test...');
testEquipmentSync().then(result => {
  console.log('Test completed:', result);
}).catch(error => {
  console.error('Test failed:', error);
});