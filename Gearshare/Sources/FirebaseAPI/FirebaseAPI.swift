import Foundation
import FirebaseFirestore

class ActivityService {
    private let db = Firestore.firestore()
    private let collectionName = "activity_logs"
    
    // Log an activity
    func logActivity(data: [String: Any], completion: @escaping (Result<Void, Error>) -> Void) {
        var activityData: [String: Any] = [
            "log_id": Date().timeIntervalSince1970,
            "activity_time": ISO8601DateFormatter().string(from: Date()),
            "collection": data["collection"] as? String ?? "system",
            "action_type": data["action_type"] as? String ?? "",
            "user_id": data["user_id"] as? String ?? "system",
            "description": data["description"] as? String ?? "",
            "details": [
                "previous_state": data["previous_state"] as Any,
                "new_state": data["new_state"] as Any,
                "affected_id": data["affected_id"] as Any
            ]
        ]
        
        db.collection(collectionName).addDocument(data: activityData) { error in
            if let error = error {
                completion(.failure(error))
            } else {
                completion(.success(()))
            }
        }
    }
    
    // Get activities with filters
    func getActivities(filters: [String: Any], completion: @escaping (Result<[[String: Any]], Error>) -> Void) {
        db.collection(collectionName).getDocuments { snapshot, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let documents = snapshot?.documents else {
                completion(.success([]))
                return
            }
            
            var activities = documents.compactMap { $0.data() }
            
            // Apply date range filter
            if let dateRange = filters["dateRange"] as? String, dateRange != "all" {
                let now = Date()
                let calendar = Calendar.current
                var startDate = now
                
                switch dateRange {
                case "today":
                    startDate = calendar.startOfDay(for: now)
                case "week":
                    startDate = calendar.date(byAdding: .day, value: -7, to: now) ?? now
                case "month":
                    startDate = calendar.date(byAdding: .month, value: -1, to: now) ?? now
                default:
                    break
                }
                
                activities = activities.filter {
                    if let activityTime = $0["activity_time"] as? String,
                       let activityDate = ISO8601DateFormatter().date(from: activityTime) {
                        return activityDate >= startDate
                    }
                    return false
                }
            }
            
            // Apply other filters
            if let actionType = filters["action_type"] as? String {
                activities = activities.filter { $0["action_type"] as? String == actionType }
            }
            
            if let collection = filters["collection"] as? String {
                activities = activities.filter { $0["collection"] as? String == collection }
            }
            
            // Sort by activity_time descending
            activities.sort {
                guard let time1 = $0["activity_time"] as? String,
                      let time2 = $1["activity_time"] as? String,
                      let date1 = ISO8601DateFormatter().date(from: time1),
                      let date2 = ISO8601DateFormatter().date(from: time2) else {
                    return false
                }
                return date1 > date2
            }
            
            completion(.success(activities))
        }
    }
}
