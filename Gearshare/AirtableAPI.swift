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
        guard let url = URL(string: urlString) else {
            print("Invalid URL.")
            return
        }
        var request = URLRequest(url: url)
        request.setValue(airtableToken, forHTTPHeaderField: "Authorization")

        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                print("Error fetching repairs: \(error.localizedDescription)")
                return
            }
            guard let data = data else {
                print("No data received from Airtable.")
                return
            }

            // I used for debugging; it prints the raw JSON response
            if let jsonString = String(data: data, encoding: .utf8) {
                print("Raw JSON response: \(jsonString)")
            }

            let decoder = JSONDecoder()
            do {
                let airtableResponse = try decoder.decode(AirtableResponse.self, from: data)
                let repairItemsWithIDs = airtableResponse.records.map { ($0.fields, $0.id) }
                completion(repairItemsWithIDs)
            } catch let DecodingError.dataCorrupted(context) {
                print("Some of the data must be coorrupted: \(context)")
            } catch let DecodingError.keyNotFound(key, context) {
                print("Key '\(key)' not found desc. \(context.debugDescription)")
                print("Coding path: \(context.codingPath)")
            } catch let DecodingError.valueNotFound(value, context) {
                print("Value '\(value)' not found desc. \(context.debugDescription)")
                print("Coding path: \(context.codingPath)")
            } catch let DecodingError.typeMismatch(type, context)  {
                print("Type '\(type)' mismatch: \(context.debugDescription)")
                print("Coding path: \(context.codingPath)")
            } catch {
                print("localized error decoding JSON desc,. \(error.localizedDescription)")
            }
        }
        task.resume()
    }

    func createRepair(_ repair: RepairItem, completion: @escaping () -> Void) {
        let urlString = "https://api.airtable.com/v0/\(baseID)/\(tableName)"
        guard let url = URL(string: urlString) else {
            print("Invalid URL.")
            return
        }
        var request = URLRequest(url: url)
        request.setValue(airtableToken, forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpMethod = "POST"

        do {
            let fieldsPayload = try JSONEncoder().encode(repair)
            let fieldsDictionary = try JSONSerialization.jsonObject(with: fieldsPayload, options: []) as! [String: Any]
            let requestBody: [String: Any] = ["fields": fieldsDictionary]
            let jsonData = try JSONSerialization.data(withJSONObject: requestBody, options: [])
            request.httpBody = jsonData
        } catch {
            print("There was an error w/ preparing request body: \(error.localizedDescription)")
            return
        }

        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                print("Couldn't create repair due to... \(error.localizedDescription)")
                return
            }

            if let httpResponse = response as? HTTPURLResponse {
                if httpResponse.statusCode != 200 && httpResponse.statusCode != 201 {
                    print("Error: HTTP status code \(httpResponse.statusCode)")
                    if let data = data, let responseBody = String(data: data, encoding: .utf8) {
                        print("Response body: \(responseBody)")
                    }
                    return
                }
            }

            if let data = data, let responseBody = String(data: data, encoding: .utf8) {
                print("That worked! Response body: \(responseBody)")
            }

            completion()
        }
        task.resume()
    }

    func updateRepair(repair: RepairItem, recordID: String, completion: @escaping () -> Void) {
        let urlString = "https://api.airtable.com/v0/\(baseID)/\(tableName)/\(recordID)"
        guard let url = URL(string: urlString) else {
            print("Invalid URL.")
            return
        }
        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        request.setValue(airtableToken, forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        do {
            let fieldsPayload = try JSONEncoder().encode(repair)
            let fieldsDictionary = try JSONSerialization.jsonObject(with: fieldsPayload, options: []) as! [String: Any]
            let requestBody: [String: Any] = ["fields": fieldsDictionary]
            let jsonData = try JSONSerialization.data(withJSONObject: requestBody, options: [])
            request.httpBody = jsonData
        } catch {
            print("Error preparing request body: \(error.localizedDescription)")
            return
        }

        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                print("Couldmn't update repair due to... \(error.localizedDescription)")
                return
            }

            if let httpResponse = response as? HTTPURLResponse {
                if httpResponse.statusCode != 200 {
                    print("Error: HTTP status code \(httpResponse.statusCode)")
                    if let data = data, let responseBody = String(data: data, encoding: .utf8) {
                        print("Response body: \(responseBody)")
                    }
                    return
                }
            }

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
