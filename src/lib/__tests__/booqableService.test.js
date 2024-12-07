import {
  fetchAllOrders,
  fetchAllProducts,
  fetchCustomerById,
  sendEmailNotification,
  createCustomer,
  updateCustomer,
  updateOrder,
  fetchOrderById,
  fetchProductById,
  createProduct
} from '../booqable/booqableService';
describe('booqableService', () => {
  test('fetchAllOrders', async () => {
    const result = await fetchAllOrders();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('number');
  });

  test('fetchAllProducts', async () => {
    const result = await fetchAllProducts();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('name');
  });

  test('fetchCustomerById', async () => {
    const customers = await fetchAllOrders();
    const customerId = customers[0].customer_id;
    const result = await fetchCustomerById(customerId);
    expect(result).toHaveProperty('id', customerId);
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('email');
  });

  test('createCustomer and updateCustomer', async () => {
    const newCustomer = await createCustomer('Test Customer', 'test@example.com');
    expect(newCustomer).toHaveProperty('id');
    expect(newCustomer).toHaveProperty('name', 'Test Customer');
    expect(newCustomer).toHaveProperty('email', 'test@example.com');

    const updatedCustomer = await updateCustomer(newCustomer.id, { name: 'Updated Test Customer' });
    expect(updatedCustomer).toHaveProperty('id', newCustomer.id);
    expect(updatedCustomer).toHaveProperty('name', 'Updated Test Customer');
  });

  test('createProduct and fetchProductById', async () => {
    const newProduct = await createProduct({ name: 'Test Product', sku: 'TEST001' });
    expect(newProduct).toHaveProperty('id');
    expect(newProduct).toHaveProperty('name', 'Test Product');
    expect(newProduct).toHaveProperty('sku', 'TEST001');

    const fetchedProduct = await fetchProductById(newProduct.id);
    expect(fetchedProduct).toEqual(newProduct);
  });

  test('updateOrder and fetchOrderById', async () => {
    const orders = await fetchAllOrders();
    const orderId = orders[0].id;

    const updatedOrder = await updateOrder(orderId, { status: 'closed' });
    expect(updatedOrder).toHaveProperty('id', orderId);
    expect(updatedOrder).toHaveProperty('status', 'closed');

    const fetchedOrder = await fetchOrderById(orderId);
    expect(fetchedOrder).toEqual(updatedOrder);
  });

  test('sendEmailNotification', async () => {
    const result = await sendEmailNotification(
      ['test@example.com'],
      'Test Subject',
      'Test Body',
      null,
      null,
      null,
      []
    );
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('type', 'emails');
  });
});