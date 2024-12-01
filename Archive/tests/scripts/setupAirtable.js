require('dotenv').config();
const AIRTABLE_API_KEY = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

// Import status enums for consistency
const { STATUS } = require('../src/lib/airtable/models.js');

// Equipment categories with colors
const EQUIPMENT_CATEGORIES = [
  { name: 'Camera', color: 'blueBright' },
  { name: 'Lens', color: 'cyanBright' },
  { name: 'Lighting', color: 'yellowBright' },
  { name: 'Audio', color: 'redBright' },
  { name: 'Grip', color: 'greenBright' },
  { name: 'Accessories', color: 'grayBright' },
  { name: 'Drones', color: 'purpleBright' },
  { name: 'Other', color: 'grayBright' }
];

async function setupAirtableTables() {
  try {
    console.log('Starting Airtable setup...');
    console.log('Using Base ID:', AIRTABLE_BASE_ID);

    // First, get existing tables
    const getTablesResponse = await fetch(`https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Log the raw response
    console.log('Response status:', getTablesResponse.status);
    const responseData = await getTablesResponse.json();
    console.log('Response data:', responseData);

    if (!getTablesResponse.ok) {
      throw new Error(`Airtable API error: ${getTablesResponse.status} - ${JSON.stringify(responseData)}`);
    }

    if (!responseData.tables) {
      throw new Error('No tables array in response: ' + JSON.stringify(responseData));
    }

    const existingTableNames = responseData.tables.map(table => table.name);
    console.log('Existing tables:', existingTableNames);

    const tables = {
      Repairs: {
        name: 'Repairs',
        fields: [
          { name: 'First Name', type: 'singleLineText' },
          { name: 'Last Name', type: 'singleLineText' },
          { name: 'Internal Notes', type: 'multilineText' },
          { name: 'Item Type', type: 'singleSelect', options: { choices: Object.values(STATUS.ITEM_TYPE) } },
          { name: 'Price Quote', type: 'currency' },
          { name: 'Final Price', type: 'currency' },
          { name: 'Type of Item', type: 'singleLineText' },
          { name: 'Damage or Defect', type: 'multilineText' },
          { name: 'Payment type', type: 'singleSelect', options: { choices: Object.values(STATUS.PAYMENTTYPE) } },
          { name: 'Brand', type: 'singleLineText' },
          { name: 'Status', type: 'singleSelect', options: { choices: Object.values(STATUS.STATUS) } },
          { name: 'Telephone', type: 'phoneNumber' },
          { name: 'Weight (Ounces)', type: 'number' },
          { name: 'Color', type: 'singleLineText' },
          { name: 'Photo/Attachment', type: 'multipleAttachments' },
          { name: 'Referred By', type: 'singleLineText' },
          { name: 'Requestor Type', type: 'singleSelect', options: { choices: Object.values(STATUS.REQUESTOR_TYPE) } },
          { name: 'Date Quoted', type: 'date' },
          { name: 'Owner', type: 'multipleRecordLinks', options: { linkedTableId: 'tblXXXXXXXXXXXXXX' } },
          { name: 'Delivery of Item', type: 'singleLineText' },
          { name: 'Email', type: 'email' },
          { name: 'Autonumber', type: 'autoNumber' },
          { name: 'Amount Paid', type: 'currency' },
          { name: 'Repair ID', type: 'singleLineText' }
        ]
      },
      Equipment: {
        name: 'Equipment',
        fields: [
          { 
            name: 'equipment_id',
            type: 'number',
            options: {
              precision: 0
            }
          },
          { 
            name: 'name',
            type: 'singleLineText'
          },
          { 
            name: 'equipment_category',
            type: 'singleSelect',
            options: {
              choices: EQUIPMENT_CATEGORIES
            }
          },
          { 
            name: 'status',
            type: 'singleSelect',
            options: {
              choices: Object.values(STATUS.EQUIPMENT).map(status => ({
                name: status,
                color: status === 'available' ? 'greenBright' : 
                       status === 'rented' ? 'yellowBright' : 'redBright'
              }))
            }
          },
          { 
            name: 'description',
            type: 'multilineText'
          },
          { 
            name: 'price',
            type: 'currency',
            options: {
              precision: 2,
              symbol: '$'
            }
          },
          {
            name: 'quantity',
            type: 'number',
            options: {
              precision: 0
            }
          },
          { 
            name: 'booqable_id',
            type: 'singleLineText'
          },
          { 
            name: 'booqableGroupId',
            type: 'singleLineText'
          },
          { 
            name: 'created_at',
            type: 'dateTime',
            options: {
              dateFormat: {
                name: 'iso'
              },
              timeFormat: {
                name: '24hour'
              },
              timeZone: 'client'
            }
          }
        ]
      }
    };

    // Create tables and fields
    for (const [tableName, schema] of Object.entries(tables)) {
      if (existingTableNames.includes(schema.name)) {
        console.log(`Table ${tableName} already exists, skipping...`);
        continue;
      }

      console.log(`Setting up ${tableName} table...`);

      const createTableResponse = await fetch(`https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: schema.name,
          description: `Table for ${schema.name}`,
          fields: schema.fields
        })
      });

      const responseData = await createTableResponse.json();

      if (!createTableResponse.ok) {
        console.error('Response:', responseData);
        throw new Error(`Failed to create table ${tableName}: ${JSON.stringify(responseData)}`);
      }

      console.log(`✅ ${tableName} table created successfully:`, responseData);
    }

    console.log('🎉 Airtable setup completed successfully!');
  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  }
}

// Run the setup
setupAirtableTables()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 