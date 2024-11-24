//
//  BooqableAPI.swift
//  Gearshare
//
//  Created by Yixiao Wu on 11/22/24.
//

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

    // Search Product by Name
    func searchProductByName(name: String, completion: @escaping (Result<[String], Error>) -> Void) {
        let searchData: [String: Any] = [
            "fields": [
                "products": "id"
            ],
            "filter": [
                "conditions": [
                    "operator": "or",
                    "attributes": [
                        [
                            "operator": "and",
                            "attributes": [
                                ["name": ["match": name]]
                            ]
                        ]
                    ]
                ]
            ]
        ]
        
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: searchData, options: .prettyPrinted)
            let request = createRequest(path: "boomerang/products/search", method: "POST", body: jsonData)
            
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
                    let productsResponse = try JSONDecoder().decode(CustomerSearchResponse.self, from: data)
                    let productIds = productsResponse.data.map { $0.id }
                    completion(.success(productIds))
                } catch {
                    completion(.failure(error))
                }
            }.resume()
        } catch {
            completion(.failure(error))
        }
    }


    // Fetch All Products
    func fetchAllProducts(completion: @escaping (Result<[Product], Error>) -> Void) {
        let request = createRequest(path: "boomerang/products", method: "GET")
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
                let productsResponse = try JSONDecoder().decode(ProductsResponse.self, from: data)
                
                if productsResponse.data.isEmpty {
                    completion(.failure(NSError(domain: "No Products Found", code: -1, userInfo: nil)))
                    return
                }
                
                let products = productsResponse.data.map { productData in
                    Product(
                        id: productData.id,
                        name: productData.attributes.name,
                        groupName: productData.attributes.group_name,
                        basePriceInCents: productData.attributes.base_price_in_cents,
                        showInStore: productData.attributes.show_in_store
                    )
                }
                completion(.success(products))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }

    // fetch all orders
    func fetchAllOrders(completion: @escaping (Result<[Order], Error>) -> Void) {
        let request = createRequest(path: "boomerang/orders?", method: "GET")
        
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

                let orders = ordersResponse.data.map { orderData -> Order in
                    let items = orderData.relationships?.items?.data.map { itemData in
                        Item(id: itemData.id, name: "", base_price_in_cents: 0) 
                    } ?? []
                    
                    return Order(
                        id: orderData.id,
                        status: orderData.attributes.status,
                        starts_at: orderData.attributes.starts_at,
                        stops_at: orderData.attributes.stops_at,
                        price_in_cents: orderData.attributes.price_in_cents,
                        items: items,
                        customer_id: orderData.attributes.customer_id

                    )
                }
                
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


    // assign the customer to order
    func assignCustomerToOrder(orderId: String, customerId: String, completion: @escaping (Result<String, Error>) -> Void) {
        let orderData: [String: Any] = [
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
                    let assignedCustomerId = orderResponse.data.attributes.customer_id ?? "Unknown"
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

    // Book items for an order
    func bookItems(orderId: String, actions: [[String: Any]], completion: @escaping (Result<String, Error>) -> Void) {
        let bookData: [String: Any] = [
            "data": [
                "type": "order_fulfillments",
                "attributes": [
                    "order_id": orderId,
                    "confirm_shortage": nil,
                    "actions": actions
                ]
            ]
        ]
        
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: bookData, options: .prettyPrinted)
            let request = createRequest(path: "boomerang/order_fulfillments", method: "POST", body: jsonData)
            
            URLSession.shared.dataTask(with: request) { data, response, error in
                if let error = error {
                    completion(.failure(error))
                    return
                }
                guard let data = data else {
                    completion(.failure(NSError(domain: "No Data", code: -1, userInfo: nil)))
                    return
                }
                print("Book Items Response: \(String(data: data, encoding: .utf8) ?? "No response body")")
                do {
                    let responseDict = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any]
                    if let error = responseDict?["error"] as? [String: Any], let message = error["message"] as? String {
                        completion(.failure(NSError(domain: "Booqable Error", code: -1, userInfo: [NSLocalizedDescriptionKey: message])))
                        return
                    }
                    if let data = responseDict?["data"] as? [String: Any],
                    let orderId = data["id"] as? String {
                        completion(.success("Items booked successfully for order \(orderId)"))
                    } else {
                        completion(.failure(NSError(domain: "Invalid Response", code: -1, userInfo: nil)))
                    }
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
    let relationships: OrderRelationships?
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

// MARK: - Relationship Models
struct OrderRelationships: Codable {
    let items: RelationshipData<ItemRelationship>?
    let lines: RelationshipData<LineData>?
    // let lines: [LineData]?
    enum CodingKeys: String, CodingKey {
        case items
        case lines
    }
}

struct RelationshipData<T: Codable>: Codable {
    let data: [T]
}

struct ItemRelationship: Codable {
    let id: String
    let type: String
}

struct LineAttributes: Codable {
    let order_id: String
    let item_id: String
    let quantity: Int
}

struct LineData: Codable {
    let id: String
    let type: String
    let attributes: LineAttributes
}

struct LineResponse: Codable {
    let data: LineData
}

struct Line: Codable {
    let id: String
    let order_id: String
    let item_id: String
    let quantity: Int
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
    let customer_id: String?
}

struct OrderData: Codable {
    let id: String
    let type: String
    let attributes: OrderAttributes
    let relationships: OrderRelationships?
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
    let items: [Item]
    let customer_id: String?
}

// MARK: - Order Response Model
struct OrderResponse: Codable {
    let data: OrderData
}

// MARK: - Product Models
struct ProductAttributes: Codable {
    let name: String
    let group_name: String
    let base_price_in_cents: Int
    let show_in_store: Bool
}

struct ProductData: Codable {
    let id: String
    let type: String
    let attributes: ProductAttributes
}

struct ProductsResponse: Codable {
    let data: [ProductData]
}

struct Product {
    let id: String
    let name: String
    let groupName: String
    let basePriceInCents: Int
    let showInStore: Bool
}
