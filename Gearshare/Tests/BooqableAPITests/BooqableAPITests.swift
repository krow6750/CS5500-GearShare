import XCTest
@testable import BooqableAPI

final class BooqableAPITests: XCTestCase {

    var api: BooqableAPI!

    override func setUp() {
        super.setUp()
        api = BooqableAPI()
        print("Set up Booqable API for testing")
    }

    override func tearDown() {
        api = nil
        print("Tear down Booqable API instance")
        super.tearDown()
    }

    // Test fetching all orders and products
    func testFetchAllOrdersAndProducts() {
        let expectation = self.expectation(description: "Fetch All Orders and Products")
        print("Starting test: Fetch All Orders and Products")

        api.fetchAllOrders { result in
            switch result {
            case .success(let orders):
                XCTAssertFalse(orders.isEmpty, "Orders list should not be empty")
                print("Fetched Orders: \(orders)")
            case .failure(let error):
                XCTFail("Failed to fetch orders: \(error.localizedDescription)")
                print("Error fetching orders: \(error)")
            }

            self.api.fetchAllProducts { result in
                switch result {
                case .success(let products):
                    XCTAssertFalse(products.isEmpty, "Products list should not be empty")
                    print("Fetched Products: \(products)")
                case .failure(let error):
                    XCTFail("Failed to fetch products: \(error.localizedDescription)")
                    print("Error fetching products: \(error)")
                }
                expectation.fulfill()
            }
        }

        waitForExpectations(timeout: 60, handler: nil)
    }

    // Test creating a customer and assigning to an order
    func testCreateCustomerAndAssignToOrder() {
        let expectation = self.expectation(description: "Create Customer and Assign to Order")
        print("Starting test: Create Customer and Assign to Order")

        // Step 1: Create a customer
        api.createCustomer(name: "Test Customer", email: "test@gmail.com") { result in
            switch result {
            case .success(let customer):
                XCTAssertNotNil(customer, "Customer creation failed")
                print("Created Customer: \(customer)")

                // Step 2: Fetch an Order ID
                self.api.fetchAllOrders { result in
                    switch result {
                    case .success(let orders):
                        guard let order = orders.first else {
                            XCTFail("No orders found")
                            expectation.fulfill()
                            return
                        }

                        let orderId = order.id
                        print("Fetched Order ID: \(orderId)")

                        // Step 3: Assign customer to order
                        self.api.assignCustomerToOrder(orderId: orderId, customerId: customer.id) { result in
                            switch result {
                            case .success(let assignedCustomerId):
                                XCTAssertEqual(assignedCustomerId, customer.id, "Customer ID should match the assigned customer")
                                print("Successfully assigned customer to order: \(assignedCustomerId)")
                            case .failure(let error):
                                XCTFail("Failed to assign customer to order: \(error.localizedDescription)")
                                print("Error assigning customer to order: \(error)")
                            }
                            expectation.fulfill()
                        }

                    case .failure(let error):
                        XCTFail("Failed to fetch orders: \(error.localizedDescription)")
                        print("Error fetching orders: \(error)")
                        expectation.fulfill()
                    }
                }

            case .failure(let error):
                XCTFail("Failed to create customer: \(error.localizedDescription)")
                print("Error creating customer: \(error)")
                expectation.fulfill()
            }
        }

        waitForExpectations(timeout: 60, handler: nil)
    }

    // Test adding a product to an order
    func testAddProductToOrder() {
        let expectation = self.expectation(description: "Add Product to Order")
        print("Starting test: Add Product to Order")

        // Step 1: Fetch an Order ID
        api.fetchAllOrders { [weak self] result in
            guard let self = self else { return }

            switch result {
            case .success(let orders):
                guard let order = orders.first else {
                    XCTFail("No orders found")
                    expectation.fulfill()
                    return
                }

                let orderId = order.id
                print("Fetched Order ID: \(orderId)")

                // Step 2: Fetch a Product ID
                self.api.fetchAllProducts { result in
                    switch result {
                    case .success(let products):
                        guard let product = products.first else {
                            XCTFail("No products found")
                            expectation.fulfill()
                            return
                        }

                        let productId = product.id
                        print("Fetched Product ID: \(productId)")

                        // Step 3: Book the product to the order
                        let actions: [[String: Any]] = [
                            [
                                "action": "book_product",
                                "mode": "create_new",
                                "product_id": productId,
                                "quantity": 1
                            ]
                        ]

                        self.api.bookItems(orderId: orderId, actions: actions) { result in
                            switch result {
                            case .success(let response):
                                XCTAssertNotNil(response, "Booking product to order failed")
                                print("Successfully added product to order: \(response)")
                            case .failure(let error):
                                XCTFail("Failed to add product to order: \(error.localizedDescription)")
                                print("Error adding product to order: \(error)")
                            }
                            expectation.fulfill()
                        }

                    case .failure(let error):
                        XCTFail("Failed to fetch products: \(error.localizedDescription)")
                        print("Error fetching products: \(error)")
                        expectation.fulfill()
                    }
                }

            case .failure(let error):
                XCTFail("Failed to fetch orders: \(error.localizedDescription)")
                print("Error fetching orders: \(error)")
                expectation.fulfill()
            }
        }

        waitForExpectations(timeout: 60, handler: nil)
    }
}
