import XCTest
@testable import BooqableAPI

class BooqableAPITests: XCTestCase {

    var api: BooqableAPI!

    override func setUp() {
        super.setUp()
        api = BooqableAPI()
    }

    override func tearDown() {
        api = nil
        super.tearDown()
    }
    

    func testFetchAllOrders() {
        let expectation = self.expectation(description: "Fetch All Orders Success")

        api.fetchAllOrders { result in
            switch result {
            case .success(let orders):
                XCTAssertGreaterThan(orders.count, 0, "Expected to find at least one order")
                for order in orders {
                    XCTAssertNotNil(order.id, "Order ID should not be nil")
                    XCTAssertNotNil(order.status, "Order status should not be nil")
                    XCTAssertNotNil(order.starts_at, "Order starts_at should not be nil")
                    XCTAssertNotNil(order.stops_at, "Order stops_at should not be nil")
                    XCTAssertGreaterThan(order.price_in_cents, -1, "Order price should be greater than -1")
                    print("Order ID: \(order.id), Status: \(order.status), Starts At: \(order.starts_at), Stops At: \(order.stops_at), Price: \(order.price_in_cents)")
                }
                expectation.fulfill()
            case .failure(let error):
                XCTFail("Expected success, but failed with error: \(error.localizedDescription)")
            }
        }

        waitForExpectations(timeout: 5, handler: nil)
    }
}