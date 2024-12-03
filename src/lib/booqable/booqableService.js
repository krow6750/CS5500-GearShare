import axios from 'axios';

const BOOQABLE_API_KEY = process.env.NEXT_PUBLIC_BOOQABLE_API_KEY || process.env.BOOQABLE_API_KEY;
const BOOQABLE_BASE_URL = process.env.NEXT_PUBLIC_BOOQABLE_BASE_URL || process.env.BOOQABLE_BASE_URL;

if (!BOOQABLE_API_KEY) {
  console.error('BOOQABLE_API_KEY is not set in environment variables');
}

if (!BOOQABLE_BASE_URL) {
  console.error('BOOQABLE_BASE_URL is not set in environment variables');
}

async function fetchAllOrders() {
  try {
    const response = await axios.get(`${BOOQABLE_BASE_URL}/boomerang/orders`, {
      headers: {
        'Authorization': `Bearer ${BOOQABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      params: {
        include: 'order_lines,customer,stock_items',
        fields: {
          orders: 'number,status,starts_at,stops_at,price_in_cents,customer_id',
          stock_items: 'identifier,product_id,customer_id,status,archived,created_at,updated_at'
        }
      }
    });

    console.log('API Response included:', response.data.included);
    console.log('First order relationships:', response.data.data[0]?.relationships);

    const orders = response.data.data.map(order => {
      console.log(`Processing order ${order.id}:`, {
        included: response.data.included?.filter(item => 
          item.type === 'stock_items' && 
          item.relationships?.order?.data?.id === order.id
        )
      });

      return {
        id: order.id,
        number: order.attributes.number || '',
        starts_at: order.attributes.starts_at,
        stops_at: order.attributes.stops_at,
        price_in_cents: order.attributes.price_in_cents || 0,
        customer_id: order.attributes.customer_id,
        status: order.attributes.status,
        stock_items: response.data.included
          ?.filter(item => 
            item.type === 'stock_items' && 
            item.relationships?.order?.data?.id === order.id
          )
          .map(stockItem => ({
            id: stockItem.id,
            identifier: stockItem.attributes.identifier,
            product_id: stockItem.attributes.product_id,
            customer_id: stockItem.attributes.customer_id,
            status: stockItem.attributes.status,
            archived: stockItem.attributes.archived,
            created_at: stockItem.attributes.created_at,
            updated_at: stockItem.attributes.updated_at
          })) || []
      };
    });

    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

async function fetchAllProducts() {
  try {
    const baseUrl = BOOQABLE_BASE_URL.endsWith('/api') 
      ? BOOQABLE_BASE_URL.slice(0, -4) 
      : BOOQABLE_BASE_URL;

    const response = await axios.get(`${baseUrl}/api/boomerang/products`, {
      headers: {
        'Authorization': `Bearer ${BOOQABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      params: {
        include: 'stock_items',
        fields: {
          products: 'name,photo_url,description,group_name,product_type,show_in_store,base_price_in_cents,sku,stock_count,status,tracking_type',
          stock_items: 'identifier,product_id,customer_id,status,archived,created_at,updated_at'
        }
      }
    });

    const products = response.data.data.map(product => ({
      id: product.id,
      name: product.attributes.name,
      photo_url: product.attributes.photo_url,
      description: product.attributes.description,
      group_name: product.attributes.group_name,
      product_type: product.attributes.product_type,
      show_in_store: product.attributes.show_in_store,
      base_price_in_cents: product.attributes.base_price_in_cents,
      sku: product.attributes.sku,
      stock_items: response.data.included
        ?.filter(item => 
          item.type === 'stock_items' && 
          item.relationships?.product?.data?.id === product.id
        )
        .map(stockItem => ({
          id: stockItem.id,
          identifier: stockItem.attributes.identifier,
          product_id: stockItem.attributes.product_id,
          customer_id: stockItem.attributes.customer_id,
          status: stockItem.attributes.status,
          archived: stockItem.attributes.archived,
          created_at: stockItem.attributes.created_at,
          updated_at: stockItem.attributes.updated_at
        })) || []
    }));

    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}


async function fetchCustomerById(customerId) {
  try {
    const response = await axios.get(`${BOOQABLE_BASE_URL}/boomerang/customers/${customerId}`, {
      headers: {
        'Authorization': `Bearer ${BOOQABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      params: {
        include: 'properties',
        fields: {
          customers: 'name,email,properties'
        }
      }
    });

    const customerData = response.data.data;

    const result = {
      id: customerData.id,
      name: customerData.attributes.name,
      email: customerData.attributes.email,
      phone: customerData.attributes.properties?.phone || null
    };

    console.log('Returned result:', JSON.stringify(result, null, 2));

    return result;
  } catch (error) {
    console.error('Error fetching customer:', error.message);
    throw error;
  }
}



async function sendEmailNotification(recipients, subject, body, email_template_id, order_id, customer_id, document_ids) {
  try {
    const response = await axios.post(
      `${BOOQABLE_BASE_URL}/boomerang/emails`,
      {
        data: {
          type: "emails",
          attributes: {
            recipients: recipients,
            subject: subject,
            body: body,
            email_template_id: email_template_id,
            order_id: order_id,
            customer_id: customer_id,
            document_ids: document_ids
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${BOOQABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Email sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending email:', error.response ? error.response.data : error.message);
    throw error;
  }
}

async function createCustomer(name, email) {
  try {
    const response = await axios.post(
      `${BOOQABLE_BASE_URL}/boomerang/customers`,
      {
        data: {
          type: "customers",
          attributes: {
            name: name,
            email: email
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${BOOQABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const createdCustomer = {
      id: response.data.data.id,
      name: response.data.data.attributes.name,
      email: response.data.data.attributes.email,
      created_at: response.data.data.attributes.created_at,
      updated_at: response.data.data.attributes.updated_at,
      number: response.data.data.attributes.number,
      deposit_type: response.data.data.attributes.deposit_type,
      deposit_value: response.data.data.attributes.deposit_value,
      discount_percentage: response.data.data.attributes.discount_percentage,
      legal_type: response.data.data.attributes.legal_type
    };

    console.log('Customer created successfully:', createdCustomer);
    return createdCustomer;
  } catch (error) {
    console.error('Error creating customer:', error.response ? error.response.data : error.message);
    throw error;
  }
}

async function updateCustomer(customerId, updateData) {
  try {
    const response = await axios.put(
      `${BOOQABLE_BASE_URL}/boomerang/customers/${customerId}`,
      {
        data: {
          id: customerId,
          type: "customers",
          attributes: updateData
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${BOOQABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const updatedCustomer = {
      id: response.data.data.id,
      name: response.data.data.attributes.name,
      email: response.data.data.attributes.email,
      created_at: response.data.data.attributes.created_at,
      updated_at: response.data.data.attributes.updated_at,
      number: response.data.data.attributes.number,
      deposit_type: response.data.data.attributes.deposit_type,
      deposit_value: response.data.data.attributes.deposit_value,
      discount_percentage: response.data.data.attributes.discount_percentage,
      legal_type: response.data.data.attributes.legal_type,
      email_marketing_consented: response.data.data.attributes.email_marketing_consented,
      properties: response.data.data.attributes.properties,
      tag_list: response.data.data.attributes.tag_list
    };

    console.log('Customer updated successfully:', updatedCustomer);
    return updatedCustomer;
  } catch (error) {
    console.error('Error updating customer:', error.response ? error.response.data : error.message);
    throw error;
  }
}

async function updateOrder(orderId, updateData) {
  try {
    const response = await axios.put(
      `${BOOQABLE_BASE_URL}/boomerang/orders/${orderId}`,
      {
        data: {
          id: orderId,
          type: "orders",
          attributes: updateData
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${BOOQABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        params: {
          fields: {
            orders: 'customer_id,tax_region_id,price_in_cents,grand_total_with_tax_in_cents,to_be_paid_in_cents,deposit_type,deposit_in_cents,deposit_paid_in_cents,starts_at,stops_at'
          }
        }
      }
    );

    const updatedOrder = {
      id: response.data.data.id,
      customer_id: response.data.data.attributes.customer_id,
      tax_region_id: response.data.data.attributes.tax_region_id,
      price_in_cents: response.data.data.attributes.price_in_cents,
      grand_total_with_tax_in_cents: response.data.data.attributes.grand_total_with_tax_in_cents,
      to_be_paid_in_cents: response.data.data.attributes.to_be_paid_in_cents,
      deposit_type: response.data.data.attributes.deposit_type,
      deposit_in_cents: response.data.data.attributes.deposit_in_cents,
      deposit_paid_in_cents: response.data.data.attributes.deposit_paid_in_cents,
      starts_at: response.data.data.attributes.starts_at,
      stops_at: response.data.data.attributes.stops_at
    };

    console.log('Order updated successfully:', updatedOrder);
    return updatedOrder;
  } catch (error) {
    if (error.response && error.response.status === 422) {
      console.error('Error updating order:', error.response.data.errors);
      throw new Error('Unable to update order: ' + error.response.data.errors[0].detail);
    } else {
      console.error('Error updating order:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
}

async function fetchOrderById(orderId) {
  try {
    const response = await axios.get(
      `${BOOQABLE_BASE_URL}/boomerang/orders/${orderId}`,
      {
        headers: {
          'Authorization': `Bearer ${BOOQABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        params: {
          include: 'customer,lines,start_location,stop_location',
          fields: {
            orders: 'number,status,starts_at,stops_at,price_in_cents,grand_total_with_tax_in_cents,to_be_paid_in_cents,deposit_in_cents,deposit_paid_in_cents,fulfillment_type,customer_id'
          }
        }
      }
    );

    const orderData = response.data.data;
    const order = {
      id: orderData.id,
      number: orderData.attributes.number,
      status: orderData.attributes.status,
      starts_at: orderData.attributes.starts_at,
      stops_at: orderData.attributes.stops_at,
      price_in_cents: orderData.attributes.price_in_cents,
      grand_total_with_tax_in_cents: orderData.attributes.grand_total_with_tax_in_cents,
      to_be_paid_in_cents: orderData.attributes.to_be_paid_in_cents,
      deposit_in_cents: orderData.attributes.deposit_in_cents,
      deposit_paid_in_cents: orderData.attributes.deposit_paid_in_cents,
      fulfillment_type: orderData.attributes.fulfillment_type,
      customer_id: orderData.attributes.customer_id
    };

    console.log('Order fetched successfully:', order);
    return order;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.error(`Order with ID ${orderId} not found`);
      throw new Error(`Order with ID ${orderId} not found`);
    } else {
      console.error('Error fetching order:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
}


async function fetchProductById(productId) {
  try {
    const response = await axios.get(
      `${BOOQABLE_BASE_URL}/boomerang/products/${productId}`,
      {
        headers: {
          'Authorization': `Bearer ${BOOQABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        params: {
          include: 'barcode,inventory_levels,photo,price_structure,product_group,properties,tax_category',
          fields: {
            products: 'created_at,updated_at,archived,name,group_name,slug,sku,product_type,tracking_type,has_variations,variation,show_in_store,base_price_in_cents,price_type,price_period,deposit_in_cents,discountable,taxable,tag_list,properties,variation_values,allow_shortage,shortage_limit'
          }
        }
      }
    );

    const productData = response.data.data;
    const product = {
      id: productData.id,
      created_at: productData.attributes.created_at,
      updated_at: productData.attributes.updated_at,
      archived: productData.attributes.archived,
      name: productData.attributes.name,
      group_name: productData.attributes.group_name,
      slug: productData.attributes.slug,
      sku: productData.attributes.sku,
      product_type: productData.attributes.product_type,
      tracking_type: productData.attributes.tracking_type,
      has_variations: productData.attributes.has_variations,
      variation: productData.attributes.variation,
      show_in_store: productData.attributes.show_in_store,
      base_price_in_cents: productData.attributes.base_price_in_cents,
      price_type: productData.attributes.price_type,
      price_period: productData.attributes.price_period,
      deposit_in_cents: productData.attributes.deposit_in_cents,
      discountable: productData.attributes.discountable,
      taxable: productData.attributes.taxable,
      tag_list: productData.attributes.tag_list,
      properties: productData.attributes.properties,
      variation_values: productData.attributes.variation_values,
      allow_shortage: productData.attributes.allow_shortage,
      shortage_limit: productData.attributes.shortage_limit
    };

    if (response.data.included) {
      product.relationships = {};
      response.data.included.forEach(item => {
        product.relationships[item.type] = item;
      });
    }

    console.log('Product fetched successfully:', product);
    return product;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.error(`Product with ID ${productId} not found`);
      throw new Error(`Product with ID ${productId} not found`);
    } else {
      console.error('Error fetching product:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
}

async function createProduct(productData) {
  try {
    const response = await axios.post(
      `${BOOQABLE_BASE_URL}/boomerang/products`,
      {
        data: {
          type: "products",
          attributes: productData
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${BOOQABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        params: {
          include: 'barcode,inventory_levels,photo,price_structure,product_group,properties,tax_category',
          fields: {
            products: 'created_at,updated_at,archived,name,group_name,slug,sku,product_type,tracking_type,has_variations,variation,show_in_store,base_price_in_cents,price_type,price_period,deposit_in_cents,discountable,taxable,tag_list,properties,variation_values,allow_shortage,shortage_limit'
          }
        }
      }
    );

    const createdProduct = {
      id: response.data.data.id,
      ...response.data.data.attributes
    };

    if (response.data.data.relationships) {
      createdProduct.relationships = response.data.data.relationships;
    }

    console.log('Product created successfully:', createdProduct);
    return createdProduct;
  } catch (error) {
    console.error('Error creating product:', error.response ? error.response.data : error.message);
    throw error;
  }
}


async function updateProduct(productId, productData) {
  try {
    const response = await axios.put(
      `${BOOQABLE_BASE_URL}/boomerang/products/${productId}`,
      {
        data: {
          id: productId,
          type: "products",
          attributes: productData
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${BOOQABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        params: {
          include: 'barcode,inventory_levels,photo,price_structure,product_group,properties,tax_category',
          fields: {
            products: 'created_at,updated_at,archived,name,group_name,slug,sku,product_type,tracking_type,has_variations,variation,show_in_store,base_price_in_cents,price_type,price_period,deposit_in_cents,discountable,taxable,tag_list,properties,variation_values,allow_shortage,shortage_limit'
          }
        }
      }
    );

    const updatedProduct = {
      id: response.data.data.id,
      ...response.data.data.attributes
    };
    
    if (response.data.data.relationships) {
      updatedProduct.relationships = response.data.data.relationships;
    }

    console.log('Product updated successfully:', updatedProduct);
    return updatedProduct;
  } catch (error) {
    console.error('Error updating product:', error.response ? error.response.data : error.message);
    throw error;
  }
}

async function fetchAllCustomers() {
  try {
    const response = await axios.get(`${BOOQABLE_BASE_URL}/boomerang/customers`, {
      headers: {
        'Authorization': `Bearer ${BOOQABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      params: {
        fields: {
          customers: 'name,email,number,properties,created_at,updated_at,deposit_type,deposit_value,discount_percentage,legal_type'
        }
      }
    });

    const customers = response.data.data.map(customer => ({
      id: customer.id,
      name: customer.attributes.name,
      email: customer.attributes.email,
      number: customer.attributes.number,
      properties: customer.attributes.properties,
      created_at: customer.attributes.created_at,
      updated_at: customer.attributes.updated_at,
      deposit_type: customer.attributes.deposit_type,
      deposit_value: customer.attributes.deposit_value,
      discount_percentage: customer.attributes.discount_percentage,
      legal_type: customer.attributes.legal_type
    }));

    console.log('Customers fetched successfully:', customers.length);
    return customers;
  } catch (error) {
    console.error('Error fetching customers:', error.response ? error.response.data : error.message);
    throw error;
  }
}


async function fetchAllRelatedData() {
  try {
    const [orders, products, customers] = await Promise.all([
      fetchAllOrders(),
      fetchAllProducts(),
      fetchAllCustomers()
    ]);

    const customerMap = new Map(customers.map(customer => [customer.id, customer]));
    const productMap = new Map(products.map(product => [product.id, product]));

    const combinedData = {
      orders: orders.map(order => ({
        ...order,
        customer: customerMap.get(order.customer_id),
        stock_items: order.stock_items.map(stockItem => ({
          ...stockItem,
          product: productMap.get(stockItem.product_id),
          customer: customerMap.get(stockItem.customer_id)
        }))
      })),
      products: products,
      customers: customers,
      lookups: {
        customerMap,
        productMap
      }
    };

    return combinedData;
  } catch (error) {
    console.error('Error fetching related data:', error);
    throw error;
  }
}

const booqableService = {
  BOOQABLE_BASE_URL,
  fetchAllOrders,
  fetchAllProducts,
  fetchCustomerById,
  sendEmailNotification, 
  createCustomer,
  updateCustomer,
  updateOrder,
  fetchOrderById, 
  fetchProductById,
  createProduct,
  updateProduct,
  fetchAllCustomers,
  fetchAllRelatedData
};

export default booqableService;
