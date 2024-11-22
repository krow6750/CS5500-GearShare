import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif

class BooqableAPI {
    private let baseURL = "https://gear-share.booqable.com/api/"
    private let apiKey = "8510333fd37ea857663fab05c399aaa44f451efa3fc2a83a237720bc919b599f"

    private func createRequest(path: String, method: String, body: Data? = nil) -> URLRequest {
        guard let url = URL(string: "\(baseURL)\(path)") else {
            fatalError("Invalid URL")
        }
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.addValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        if let body = body {
            request.httpBody = body
        }
        return request
    }

    // Create Customer
    func createCustomer(name: String, email: String, completion: @escaping (Result<CustomerDetail, Error>) -> Void) {
        let customerData: [String: Any] = [
            "data": [
                "type": "customers",
                "attributes": [
                    "name": name,
                    "email": email
                ]
            ]
        ]

        do {
            let jsonData = try JSONSerialization.data(withJSONObject: customerData, options: .prettyPrinted)
            let request = createRequest(path: "boomerang/customers", method: "POST", body: jsonData)
            URLSession.shared.dataTask(with: request) { data, response, error in
                if let error = error {
                    completion(.failure(error))
                    return
                }
                guard let data = data else {
                    completion(.failure(NSError(domain: "No Data", code: -1, userInfo: nil)))
                    return
                }
                do {
                    let customerResponse = try JSONDecoder().decode(CustomerResponse.self, from: data)
                    let customerDetail = CustomerDetail(name: customerResponse.data.attributes.name,
                                                        email: customerResponse.data.attributes.email)
                    completion(.success(customerDetail))
                } catch {
                    completion(.failure(error))
                }
            }.resume()
        } catch {
            completion(.failure(error))
        }
    }

    // Search Customer by Email
    func searchCustomerByEmail(email: String, completion: @escaping (Result<[String], Error>) -> Void) {
        let searchData: [String: Any] = [
            "fields": [
                "customers": "id"
            ],
            "filter": [
                "conditions": [
                    "operator": "and",
                    "attributes": [
                        [
                            "operator": "or",
                            "attributes": [
                                ["email": email]
                            ]
                        ]
                    ]
                ]
            ]
        ]

        do {
            let jsonData = try JSONSerialization.data(withJSONObject: searchData, options: .prettyPrinted)
            let request = createRequest(path: "boomerang/customers/search", method: "POST", body: jsonData)
            URLSession.shared.dataTask(with: request) { data, response, error in
                if let error = error {
                    completion(.failure(error))
                    return
                }
                guard let data = data else {
                    completion(.failure(NSError(domain: "No Data", code: -1, userInfo: nil)))
                    return
                }
                do {
                    let searchResponse = try JSONDecoder().decode(CustomerSearchResponse.self, from: data)
                    let customerIds = searchResponse.data.map { $0.id }
                    completion(.success(customerIds))
                } catch {
                    completion(.failure(error))
                }
            }.resume()
        } catch {
            completion(.failure(error))
        }
    }

    // Fetch All Items
    func fetchAllItems(completion: @escaping (Result<[Item], Error>) -> Void) {
        let request = createRequest(path: "boomerang/items", method: "GET")
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            guard let data = data else {
                completion(.failure(NSError(domain: "No Data", code: -1, userInfo: nil)))
                return
            }
            
            do {
                let itemsResponse = try JSONDecoder().decode(ItemsResponse.self, from: data)
                
                if itemsResponse.data.isEmpty {
                    completion(.failure(NSError(domain: "No Items Found", code: -1, userInfo: nil)))
                    return
                }

                let items = itemsResponse.data.map { Item(id: $0.id, name: $0.attributes.name, base_price_in_cents: $0.attributes.base_price_in_cents) }
                completion(.success(items))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
}

// MARK: - Customer Models
struct CustomerAttributes: Codable {
    let name: String
    let email: String
}

struct CustomerData: Codable {
    let id: String
    let type: String
    let attributes: CustomerAttributes
}

struct CustomerResponse: Codable {
    let data: CustomerData
}

struct CustomerDetail: Codable {
    let name: String
    let email: String
}

struct CustomerSearchData: Codable {
    let id: String
}

struct CustomerSearchResponse: Codable {
    let data: [CustomerSearchData]
}

// MARK: - Item Models
struct ItemAttributes: Codable {
    let name: String
    let base_price_in_cents: Int
}

struct ItemData: Codable {
    let id: String
    let type: String
    let attributes: ItemAttributes
}

struct ItemsResponse: Codable {
    let data: [ItemData]
}

struct Item {
    let id: String
    let name: String
    let base_price_in_cents: Int
}