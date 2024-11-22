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

    func testCreateCustomerAndAssignToOrder() {
        let expectation = self.expectation(description: "Create Customer and Assign to Order Success")
        
        let customerName = "usertest"
        let customerEmail = "usertest@gmail.com"
        
        // Step 1: Create a new customer
        api.createCustomer(name: customerName, email: customerEmail) { result in
            switch result {
            case .success(let customerDetail):
                XCTAssertNotNil(customerDetail, "Customer details should not be nil")
                XCTAssertEqual(customerDetail.email, customerEmail, "Customer email should match the input email")
                
                print("Created Customer: \(customerDetail.name), \(customerDetail.email)")

                // Step 2: Once the customer is created, assign this customer to the order
                let orderId = "77b39f6a-e5c9-42b9-a121-3d9398503fbd" // The provided order ID
                let customerId = customerDetail.id // Use the correct customer ID

                // Print to debug the request before making the API call
                print("Assigning Customer ID \(customerId) to Order ID \(orderId)")

                self.api.assignCustomerToOrder(orderId: orderId, customerId: customerId) { result in
                    switch result {
                    case .success(let assignedCustomerId):
                        XCTAssertEqual(assignedCustomerId, customerDetail.id, "Assigned customer ID should match the created customer's ID")
                        print("Assigned Customer ID: \(assignedCustomerId)")  
                    case .failure(let error):
                        XCTFail("Expected success, but failed with error: \(error.localizedDescription)")
                    }
                    expectation.fulfill() // Mark the assignment as complete
                }
                
            case .failure(let error):
                XCTFail("Failed to create customer with error: \(error.localizedDescription)")
                expectation.fulfill() // Fulfill the expectation in case of failure
            }
        }

        waitForExpectations(timeout: 10, handler: nil)
    }
}
