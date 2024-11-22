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
    
    func testCreateOrder() {
        let expectation = self.expectation(description: "Create Order Success")
        
        let startsAt = "2024-11-21T09:23:48.024Z"
        let stopsAt = "2024-12-30T09:23:48.024Z"
        
        api.createOrder(startsAt: startsAt, stopsAt: stopsAt) { result in
            switch result {
            case .success(let orderId):
                XCTAssertNotNil(orderId, "Order ID should not be nil")
                XCTAssertTrue(orderId.count > 0, "Order ID should not be empty")
                print("Created Order ID: \(orderId)")  
            case .failure(let error):
                XCTFail("Expected success, but failed with error: \(error.localizedDescription)")
            }
        }

        waitForExpectations(timeout: 5, handler: nil)
    }
}