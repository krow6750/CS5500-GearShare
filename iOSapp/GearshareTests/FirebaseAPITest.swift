//
//  FirebaseAPITest.swift
//  Gearshare
//
//  Created by Kevin Chen on 11/24/24.
//

import XCTest
import FirebaseFirestore
@testable import GearshareApp // Replace with the actual module name of your app

class ActivityServiceTests: XCTestCase {

    var activityService: ActivityService!
    var mockFirestore: Firestore!

    override func setUp() {
        super.setUp()
        // Mock Firestore setup
        let settings = FirestoreSettings()
        settings.isPersistenceEnabled = false
        mockFirestore = Firestore.firestore()
        mockFirestore.settings = settings

        activityService = ActivityService()
    }

    override func tearDown() {
        activityService = nil
        mockFirestore = nil
        super.tearDown()
    }

    func testLogActivity_Success() {
        let expectation = self.expectation(description: "Log activity success")
        
        let testActivity: [String: Any] = [
            "collection": "test_collection",
            "action_type": "test_action",
            "user_id": "test_user",
            "description": "test_description",
            "previous_state": "old_state",
            "new_state": "new_state",
            "affected_id": "123"
        ]
        
        activityService.logActivity(data: testActivity) { result in
            switch result {
            case .success:
                XCTAssertTrue(true, "Activity logged successfully.")
            case .failure(let error):
                XCTFail("Failed to log activity: \(error)")
            }
            expectation.fulfill()
        }
        
        wait(for: [expectation], timeout: 5.0)
    }

    func testGetActivities_NoFilters() {
        let expectation = self.expectation(description: "Fetch activities without filters")
        
        activityService.getActivities(filters: [:]) { result in
            switch result {
            case .success(let activities):
                XCTAssertNotNil(activities, "Activities should not be nil")
                XCTAssertGreaterThanOrEqual(activities.count, 0, "Activities count should be at least 0")
            case .failure(let error):
                XCTFail("Failed to fetch activities: \(error)")
            }
            expectation.fulfill()
        }
        
        wait(for: [expectation], timeout: 5.0)
    }

    func testGetActivities_WithFilters() {
        let expectation = self.expectation(description: "Fetch activities with filters")
        
        let filters: [String: Any] = [
            "dateRange": "week",
            "action_type": "test_action",
            "collection": "test_collection"
        ]
        
        activityService.getActivities(filters: filters) { result in
            switch result {
            case .success(let activities):
                XCTAssertNotNil(activities, "Activities should not be nil")
                XCTAssertTrue(activities.allSatisfy { $0["action_type"] as? String == "test_action" },
                              "All activities should match the filter criteria for action_type.")
                XCTAssertTrue(activities.allSatisfy { $0["collection"] as? String == "test_collection" },
                              "All activities should match the filter criteria for collection.")
            case .failure(let error):
                XCTFail("Failed to fetch activities: \(error)")
            }
            expectation.fulfill()
        }
        
        wait(for: [expectation], timeout: 5.0)
    }
}
