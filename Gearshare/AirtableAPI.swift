//
//  AirtableAPI.swift
//  Gearshare
//
//  Created by Comus Hardman IV on 10/15/24.
//
import Foundation

class AirtableAPI {
    private let baseID = "app1helCs52glqwJZ"
    private let tableName = "Repairs"
    private let airtableToken = "Bearer pataVR7ccwUpyCUlG.47239ae53b3e8b560aa64d77dc8a8b97f91260b747ae4b4c2fff27a65d4a279d"
    
    func fetchRepairs(completion: @escaping ([(RepairItem, String)]) -> Void) {
        let urlString = "https://api.airtable.com/v0/\(baseID)/\(tableName)"
        let url = URL(string: urlString)!
        var request = URLRequest(url: url)
        request.setValue(airtableToken, forHTTPHeaderField: "Authorization")
        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            if error != nil {
                return
            }
            let data = data!
            let decoder = JSONDecoder()
            do {
                let airtableResponse = try decoder.decode(AirtableResponse.self, from: data)
                let repairItemsWithIDs = airtableResponse.records.map { ($0.fields, $0.id) }
                completion(repairItemsWithIDs)
            } catch {
                print("Decoding error")
            }
        }
        task.resume()
    }
    
    func createRepair(_ repair: RepairItem, completion: @escaping () -> Void) {
        let urlString = "https://api.airtable.com/v0/\(baseID)/\(tableName)"
        let url = URL(string: urlString)!
        var request = URLRequest(url: url)
        request.setValue(airtableToken, forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpMethod = "POST"
        let newRecord = AirtableRecord(id: "", fields: repair)
        let payload = AirtableResponse(records: [newRecord])
        let requestBody = try! JSONEncoder().encode(payload)
        request.httpBody = requestBody
        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            completion()
        }
        task.resume()
    }
    
    func updateRepair(repair: RepairItem, recordID: String, completion: @escaping () -> Void) {
        let urlString = "https://api.airtable.com/v0/\(baseID)/\(tableName)/\(recordID)"
        let url = URL(string: urlString)!
        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        request.setValue(airtableToken, forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let requestBody: [String: Any] = [
            "fields": [
                "First Name": repair.firstName ?? "",
                "Last Name": repair.lastName ?? "",
                "Type of Item": repair.typeOfItem ?? "",
                "Damage or Defect": repair.damageDescription ?? "",
                "Price Quote": repair.priceQuote ?? 0.0,
                "Status": repair.status ?? "",
                "Email": repair.email ?? ""
            ]
        ]
        let jsonData = try! JSONSerialization.data(withJSONObject: requestBody, options: [])
        request.httpBody = jsonData
        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            completion()
        }
        task.resume()
    }
}

struct AirtableResponse: Codable {
    let records: [AirtableRecord]
}

struct AirtableRecord: Codable {
    let id: String
    let fields: RepairItem
}
