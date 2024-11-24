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

    func testFetchAllItems() {
        let expectation = self.expectation(description: "Fetch All Items")
        print("Starting test: Fetch All Items")

        api.fetchAllItems { result in
            switch result {
            case .success(let items):
                XCTAssertFalse(items.isEmpty, "Items list should not be empty")
                print("Fetched Items: \(items)")
            case .failure(let error):
                XCTFail("Failed to fetch items: \(error.localizedDescription)")
                print("Error fetching items: \(error)")
            }
            expectation.fulfill()
        }

        waitForExpectations(timeout: 30, handler: nil)
    }

    func testFetchAllOrders() {
        let expectation = self.expectation(description: "Fetch All Orders")
        print("Starting test: Fetch All Orders")

        api.fetchAllOrders { result in
            switch result {
            case .success(let orders):
                XCTAssertFalse(orders.isEmpty, "Orders list should not be empty")
                print("Fetched Orders: \(orders)")
            case .failure(let error):
                XCTFail("Failed to fetch orders: \(error.localizedDescription)")
                print("Error fetching orders: \(error)")
            }
            expectation.fulfill()
        }

        waitForExpectations(timeout: 30, handler: nil)
    }

    func testAddLineToOrder() {
        let expectation = self.expectation(description: "Add Line to Order")
        print("Starting test: Add Line to Order")

        // Step 1: Fetch an Order ID
        api.fetchAllOrders { [weak self] result in
            guard let self = self else { return }

            switch result {
            case .success(let orders):
                guard let order = orders.first else {
                    XCTFail("No orders found")
                    print("No orders available to test")
                    expectation.fulfill()
                    return
                }

                let orderId = order.id
                print("Fetched Order ID: \(orderId)")

                // Step 2: Fetch an Item ID
                self.api.fetchAllItems { result in
                    switch result {
                    case .success(let items):
                        guard let item = items.first else {
                            XCTFail("No items found")
                            print("No items available to test")
                            expectation.fulfill()
                            return
                        }

                        let itemId = item.id
                        print("Fetched Item ID: \(itemId)")

                        // Step 3: Add Line to Order
                        self.api.addLineToOrder(orderId: orderId, itemId: itemId, quantity: 1) { result in
                            switch result {
                            case .success(let lineId):
                                XCTAssertNotNil(lineId, "Line ID should not be nil")
                                print("Successfully added line to order: \(lineId)")
                            case .failure(let error):
                                XCTFail("Failed to add line to order: \(error.localizedDescription)")
                                print("Error adding line to order: \(error)")
                            }
                            expectation.fulfill()
                        }

                    case .failure(let error):
                        XCTFail("Failed to fetch items: \(error.localizedDescription)")
                        print("Error fetching items: \(error)")
                        expectation.fulfill()
                    }
                }

            case .failure(let error):
                XCTFail("Failed to fetch orders: \(error.localizedDescription)")
                print("Error fetching orders: \(error)")
                expectation.fulfill()
            }
        }

        waitForExpectations(timeout: 30, handler: nil)
    }

}
