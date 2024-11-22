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
                    let customerDetail = CustomerDetail(id: customerResponse.data.id,
                                                        name: customerResponse.data.attributes.name,
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

    // Search Item by Name
    func searchItemByName(name: String, completion: @escaping (Result<[Item], Error>) -> Void) {
        let searchData: [String: Any] = [
            "fields": [
                "items": "id"
            ],
            "filter": [
                "conditions": [
                    "operator": "or",
                    "attributes": [
                        [
                            "operator": "and",
                            "attributes": [
                                ["name": name]
                            ]
                        ]
                    ]
                ]
            ]
        ]
        
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: searchData, options: .prettyPrinted)
            let request = createRequest(path: "boomerang/items/search", method: "POST", body: jsonData)
            
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
        } catch {
            completion(.failure(error))
        }
    }

    // Fetch All Orders
    func fetchAllOrders(completion: @escaping (Result<[Order], Error>) -> Void) {
        let request = createRequest(path: "boomerang/orders", method: "GET")
        
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
                let ordersResponse = try JSONDecoder().decode(OrdersResponse.self, from: data)
                
                if ordersResponse.data.isEmpty {
                    completion(.failure(NSError(domain: "No Orders Found", code: -1, userInfo: nil)))
                    return
                }

                let orders = ordersResponse.data.map { Order(
                    id: $0.id,
                    status: $0.attributes.status,
                    starts_at: $0.attributes.starts_at,
                    stops_at: $0.attributes.stops_at,
                    price_in_cents: $0.attributes.price_in_cents
                )}
                
                completion(.success(orders))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }

    // Create Order 
    func createOrder(startsAt: String, stopsAt: String, completion: @escaping (Result<String, Error>) -> Void) {
        let orderData: [String: Any] = [
            "data": [
                "type": "orders",
                "attributes": [
                    "starts_at": startsAt,
                    "stops_at": stopsAt
                ]
            ]
        ]
        
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: orderData, options: .prettyPrinted)
            let request = createRequest(path: "boomerang/orders", method: "POST", body: jsonData)
            
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
                    let orderResponse = try JSONDecoder().decode(OrderResponse.self, from: data)
                    let orderId = orderResponse.data.id  
                    
                    completion(.success(orderId))  
                } catch {
                    completion(.failure(error))
                }
            }.resume()
        } catch {
            completion(.failure(error))
        }
    }

    // Assign Customer to an Order
    func assignCustomerToOrder(orderId: String, customerId: String, completion: @escaping (Result<String, Error>) -> Void) {
        let orderData: [String: Any] = [
            "fields": [
                "orders": "customer_id,tax_region_id,price_in_cents,grand_total_with_tax_in_cents,to_be_paid_in_cents"
            ],
            "data": [
                "id": orderId,
                "type": "orders",
                "attributes": [
                    "customer_id": customerId
                ]
            ]
        ]

        do {
            let jsonData = try JSONSerialization.data(withJSONObject: orderData, options: .prettyPrinted)
            let request = createRequest(path: "boomerang/orders/\(orderId)", method: "PUT", body: jsonData)

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
                    let orderResponse = try JSONDecoder().decode(OrderResponse.self, from: data)
                    print("Response Data: \(orderResponse)")
                    let assignedCustomerId = orderResponse.data.attributes.customer_id
                    completion(.success(assignedCustomerId))
                } catch {
                    completion(.failure(error))
                }
            }.resume()
        } catch {
            completion(.failure(error))
        }
    }

    // Update stops_at for an order
    func updateStopsAt(orderId: String, stopsAt: String, completion: @escaping (Result<String, Error>) -> Void) {
        let orderData: [String: Any] = [
            "data": [
                "id": orderId,
                "type": "orders",
                "attributes": [
                    "stops_at": stopsAt
                ]
            ]
        ]
        
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: orderData, options: .prettyPrinted)
            let request = createRequest(path: "boomerang/orders/\(orderId)", method: "PUT", body: jsonData)

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
                    let orderResponse = try JSONDecoder().decode(OrderResponse.self, from: data)
                    let updatedStopsAt = orderResponse.data.attributes.stops_at
                    completion(.success(updatedStopsAt))
                } catch {
                    completion(.failure(error))
                }
            }.resume()
        } catch {
            completion(.failure(error))
        }
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
    let id: String
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

// MARK: - Order Models
struct OrderAttributes: Codable {
    let status: String
    let starts_at: String
    let stops_at: String
    let price_in_cents: Int
    let customer_id: String
}

struct OrderData: Codable {
    let id: String
    let type: String
    let attributes: OrderAttributes
}

struct OrdersResponse: Codable {
    let data: [OrderData]
}

struct Order {
    let id: String
    let status: String
    let starts_at: String
    let stops_at: String
    let price_in_cents: Int
}

// MARK: - Order Response Model
struct OrderResponse: Codable {
    let data: OrderData
}
