const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const BOOQABLE_BASE_URL = 'https://gear-share.booqable.com/api/1';
const BOOQABLE_API_KEY = '8510333fd37ea857663fab05c399aaa44f451efa3fc2a83a237720bc919b599f';

app.post('/api/create-test-product', async (req, res) => {
    try {
        // Step 1: Create a product group with product
        const groupData = {
            product_group: {
                name: "Test Equipment " + Date.now(),
                sku: "TEST_" + Date.now(),
                lag_time: 1800,
                lead_time: 360,
                always_available: false,
                trackable: true,
                archived: false,
                description: "Test equipment description",
                show_in_store: true,
                price_type: "simple",
                price_period: "day",
                flat_fee_price_in_cents: 1000,
                structure_price_in_cents: 0,
                deposit_in_cents: 0,
                stock_count: 5,
                has_variations: false,
                quantity: 5
            }
        };

        const productResponse = await axios({
            method: 'POST',
            url: `${BOOQABLE_BASE_URL}/product_groups?api_key=${BOOQABLE_API_KEY}`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: groupData
        });

        const productId = productResponse.data.product_group.products[0].id;
        console.log('Product created:', productId);

        res.json({
            message: "Test product created successfully",
            productId: productId,
            productDetails: productResponse.data
        });
    } catch (error) {
        console.error('Error:', error.response?.data || error);
        res.status(500).json({ error: error.response?.data || error.message });
    }
});

app.post('/api/test-order', async (req, res) => {
    try {
        // Step 1: Create a test product first
        const productResponse = await axios.post('http://localhost:3000/api/create-test-product');
        const newProductId = productResponse.data.productId;
        console.log('Created new product:', newProductId);

        // Step 2: Create a test customer
        const customerData = {
            customer: {
                name: "Test Customer",
                properties_attributes: [
                    {
                        type: "Property::Phone",
                        name: "Phone",
                        value: "+1234567890"
                    }
                ]
            }
        };

        const customerResponse = await axios({
            method: 'POST',
            url: `${BOOQABLE_BASE_URL}/customers?api_key=${BOOQABLE_API_KEY}`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: customerData
        });

        const customerId = customerResponse.data.customer.id;
        console.log('Customer created:', customerId);

        // Step 3: Create initial order
        const createOrderResponse = await axios({
            method: 'POST',
            url: `${BOOQABLE_BASE_URL}/orders?api_key=${BOOQABLE_API_KEY}`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                order: {
                    customer_id: customerId,
                    starts_at: "2024-11-20T10:00:00.000Z",
                    stops_at: "2024-11-22T10:00:00.000Z",
                    status: "new",
                    tax_strategy: "exclusive",
                    currency: "pkr"
                }
            }
        });

        const orderId = createOrderResponse.data.order.id;
        console.log('Order created:', orderId);

        // Step 4: Add line items using the booking endpoint
        const addItemsResponse = await axios({
            method: 'POST',
            url: `${BOOQABLE_BASE_URL}/orders/${orderId}/book?api_key=${BOOQABLE_API_KEY}`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                ids: {
                    [newProductId]: 1  // Use the newly created product ID
                }
            }
        });

        console.log('Items booked:', addItemsResponse.data);

        // Step 5: Save as concept
        await axios({
            method: 'POST',
            url: `${BOOQABLE_BASE_URL}/orders/${orderId}/concept?api_key=${BOOQABLE_API_KEY}`,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Get final order details
        const finalResponse = await axios({
            method: 'GET',
            url: `${BOOQABLE_BASE_URL}/orders/${orderId}?api_key=${BOOQABLE_API_KEY}`,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        res.json(finalResponse.data);
    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data
        });
        res.status(500).json({ 
            error: error.response?.data || error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});