const BOOQABLE_API_KEY = process.env.BOOQABLE_API_KEY || '8c4659d5c06c2f282238a6f8a65fb187e177da40c2c8b00b37ecb69321e8ce3b';
const BOOQABLE_BASE_URL = `https://gear-share-maine-testing.booqable.com/api/1`;

export const booqableService = {
  createProduct: async (equipmentData) => {
    try {
      const timestamp = Date.now();
      const uniqueName = `${equipmentData.name}_${timestamp}`;
      const uniqueSku = `${equipmentData.name.toUpperCase().replace(/\s+/g, '_')}_${timestamp}`;
      const quantity = parseInt(equipmentData.quantity) || 1;

      const groupData = {
        product_group: {
          name: uniqueName,
          sku: uniqueSku,
          lag_time: 1800,
          lead_time: 360,
          always_available: false,
          trackable: true,
          description: equipmentData.description || '',
          show_in_store: true,
          price_type: "simple",
          price_period: "day",
          flat_fee_price_in_cents: Math.round((equipmentData.price || 0) * 100),
          structure_price_in_cents: 0,
          deposit_in_cents: 0,
          stock_count: quantity,
          has_variations: false,
          quantity: quantity
        }
      };

      const response = await fetch(`${BOOQABLE_BASE_URL}/product_groups?api_key=${BOOQABLE_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(groupData)
      });

      const responseData = await response.json();
      console.log('Product creation response:', responseData);
      
      const groupId = responseData.product_group.id;
      const productId = responseData.product_group.products?.[0]?.id;

      return {
        product: { id: productId },
        group: { id: groupId }
      };
    } catch (error) {
      console.error('Booqable error:', error);
      throw error;
    }
  },

  createRental: async (rentalData) => {
    try {
      console.log('Creating rental with base URL:', BOOQABLE_BASE_URL);
      
      // Step 1: Create customer first
      const customerPayload = {
        customer: {
          name: rentalData.customer_name || 'Guest Customer',
          properties_attributes: []
        }
      };

      if (rentalData.customer_phone) {
        customerPayload.customer.properties_attributes.push({
          type: "Property::Phone",
          name: "Phone",
          value: String(rentalData.customer_phone)
        });
      }

      const customerResponse = await fetch(`${BOOQABLE_BASE_URL}/customers?api_key=${BOOQABLE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerPayload)
      });

      const customerResult = await customerResponse.json();
      console.log('Customer creation response:', customerResult);
      
      if (!customerResult.customer?.id) {
        throw new Error('Failed to create customer');
      }

      // Step 2: Create initial order
      const orderResponse = await fetch(`${BOOQABLE_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BOOQABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          order: {
            customer_id: customerResult.customer.id,
            starts_at: new Date(rentalData.start_date).toISOString(),
            stops_at: new Date(rentalData.end_date).toISOString()
          }
        })
      });

      const orderResult = await orderResponse.json();
      console.log('Order creation response:', orderResult);
      
      if (!orderResult.order?.id) {
        throw new Error('Failed to create order');
      }

      // Step 3: Book the items
      const bookResponse = await fetch(`${BOOQABLE_BASE_URL}/orders/${orderResult.order.id}/book`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BOOQABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ids: {
            [rentalData.equipment_booqable_id]: parseInt(rentalData.quantity) || 1
          }
        })
      });

      const bookResult = await bookResponse.json();
      console.log('Book items response:', bookResult);
      
      if (bookResult.error) {
        throw new Error(bookResult.error.message || 'Failed to book items');
      }

      // Step 4: Save as concept
      const conceptResponse = await fetch(`${BOOQABLE_BASE_URL}/orders/${orderResult.order.id}/concept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BOOQABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const conceptResult = await conceptResponse.json();
      console.log('Concept save response:', conceptResult);
      
      if (!conceptResult.order) {
        throw new Error('Failed to save order as concept');
      }

      return conceptResult;
    } catch (error) {
      console.error('Booqable API error:', error);
      throw error;
    }
  },

  archiveProduct: async (productId) => {
    try {
      const response = await fetch(`${BOOQABLE_BASE_URL}/product_groups/${productId}/archive`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${BOOQABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to archive product in Booqable');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error archiving product in Booqable:', error);
      throw error;
    }
  },

  restoreProduct: async (productId) => {
    try {
      const response = await fetch(`${BOOQABLE_BASE_URL}/product_groups/${productId}/restore`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BOOQABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to restore product in Booqable');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error restoring product in Booqable:', error);
      throw error;
    }
  },

  getProducts: async () => {
    try {
      const response = await fetch(`${BOOQABLE_BASE_URL}/products`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.BOOQABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Booqable API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Booqable service error:', error);
      throw error;
    }
  }
};