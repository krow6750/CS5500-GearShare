//
//  RepairItem.swift
//  Gearshare
//
//  Created by Comus Hardman IV on 10/15/24.
//
import Foundation

// Model I'm using to represent the repair items fetched from Airtable
struct RepairItem: Codable {
    var repairID: String?
    var owner: OwnerInfo?
    var internalNotes: String?
    var dateQuoted: String?
    var status: String?
    var typeOfItem: String?
    var brand: String?
    var color: String?
    var damageDescription: String?
    var photoURL: String?
    var photoAttachments: [PhotoAttachment]?
    var priceQuote: Double?
    var finalPrice: Double?
    var amountPaid: Double?
    var paymentType: String?
    var deliveryOfItem: String?
    var requestorType: String?
    var firstName: String?
    var lastName: String?
    var telephone: String?
    var email: String?
    var referredBy: String?
    var submittedOn: String?
    var createdOn: String?
    var weight: Double?
    var dateForZapier: String?
    var sendPriceEmail: String?

    struct OwnerInfo: Codable {
        var id: String?
        var email: String?
        var name: String?
    }
    
    struct PhotoAttachment: Codable {
        var id: String?
        var url: String?
        var filename: String?
        var width: Int?
        var height: Int?
        var size: Int?
        var type: String?
    }
    
    // For mapping JSON keys to the struct properties
    enum CodingKeys: String, CodingKey {
        case repairID = "Repair ID"
        case owner = "Owner"
        case internalNotes = "Internal Notes"
        case dateQuoted = "Date Quoted"
        case status = "Status"
        case typeOfItem = "Type of Item"
        case brand = "Brand"
        case color = "Color"
        case damageDescription = "Damage or Defect"
        case photoAttachments = "Photo/Attachment"
        case priceQuote = "Price Quote"
        case finalPrice = "Final Price"
        case amountPaid = "Amount Paid"
        case paymentType = "Payment type"
        case deliveryOfItem = "Delivery of Item"
        case requestorType = "Requestor Type"
        case firstName = "First Name"
        case lastName = "Last Name"
        case telephone = "Telephone"
        case email = "Email"
        case referredBy = "Referred By"
        case submittedOn = "Submitted On"
        case createdOn = "Created"
        case weight = "Weight (Ounces)"
        case dateForZapier = "(For Zapier)"
        case sendPriceEmail = "Send Price Email"
    }
}
