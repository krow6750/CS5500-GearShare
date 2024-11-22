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
    func testFetchAllItems() {
        let expectation = self.expectation(description: "Fetch All Items Success")
        api.fetchAllItems { result in
            switch result {
            case .success(let items):
                XCTAssertGreaterThan(items.count, 0, "No items found.")
                for item in items {
                    XCTAssertNotNil(item.id)
                    XCTAssertNotNil(item.name)
                    XCTAssertGreaterThan(item.base_price_in_cents, 0, "Item price should be greater than 0")
                    print("Item: \(item.id), \(item.name), \(item.base_price_in_cents)")  
                }
                expectation.fulfill()

            case .failure(let error):
                XCTFail("Expected success, but failed with error: \(error.localizedDescription)")
            }
        }
        waitForExpectations(timeout: 5, handler: nil)
    }
}
