//
//  RepairItem.swift
//  Gearshare
//
//  Created by Comus Hardman IV on 10/15/24.
//

import Foundation

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
    var sentEmail: Bool?
    
    init(
        repairID: String? = nil,
        owner: OwnerInfo? = nil,
        internalNotes: String? = nil,
        dateQuoted: String? = nil,
        status: String? = nil,
        typeOfItem: String? = nil,
        brand: String? = nil,
        color: String? = nil,
        damageDescription: String? = nil,
        photoURL: String? = nil,
        photoAttachments: [PhotoAttachment]? = nil,
        priceQuote: Double? = nil,
        finalPrice: Double? = nil,
        amountPaid: Double? = nil,
        paymentType: String? = nil,
        deliveryOfItem: String? = nil,
        requestorType: String? = nil,
        firstName: String? = nil,
        lastName: String? = nil,
        telephone: String? = nil,
        email: String? = nil,
        referredBy: String? = nil,
        submittedOn: String? = nil,
        createdOn: String? = nil,
        weight: Double? = nil,
        dateForZapier: String? = nil,
        sendPriceEmail: String? = nil,
        sentEmail: Bool? = nil
    ) {
        self.repairID = repairID
        self.owner = owner
        self.internalNotes = internalNotes
        self.dateQuoted = dateQuoted
        self.status = status
        self.typeOfItem = typeOfItem
        self.brand = brand
        self.color = color
        self.damageDescription = damageDescription
        self.photoURL = photoURL
        self.photoAttachments = photoAttachments
        self.priceQuote = priceQuote
        self.finalPrice = finalPrice
        self.amountPaid = amountPaid
        self.paymentType = paymentType
        self.deliveryOfItem = deliveryOfItem
        self.requestorType = requestorType
        self.firstName = firstName
        self.lastName = lastName
        self.telephone = telephone
        self.email = email
        self.referredBy = referredBy
        self.submittedOn = submittedOn
        self.createdOn = createdOn
        self.weight = weight
        self.dateForZapier = dateForZapier
        self.sendPriceEmail = sendPriceEmail
        self.sentEmail = sentEmail
    }

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
        case photoURL = "Photo URL"
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
        case sentEmail = "Sent Email"
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        repairID = try container.decodeIfPresent(String.self, forKey: .repairID)
        owner = try container.decodeIfPresent(OwnerInfo.self, forKey: .owner)
        internalNotes = try container.decodeIfPresent(String.self, forKey: .internalNotes)
        dateQuoted = try container.decodeIfPresent(String.self, forKey: .dateQuoted)
        status = try container.decodeIfPresent(String.self, forKey: .status)
        typeOfItem = try container.decodeIfPresent(String.self, forKey: .typeOfItem)
        brand = try container.decodeIfPresent(String.self, forKey: .brand)
        color = try container.decodeIfPresent(String.self, forKey: .color)
        damageDescription = try container.decodeIfPresent(String.self, forKey: .damageDescription)
        photoURL = try container.decodeIfPresent(String.self, forKey: .photoURL)
        photoAttachments = try container.decodeIfPresent([PhotoAttachment].self, forKey: .photoAttachments)
        priceQuote = try container.decodeIfPresent(Double.self, forKey: .priceQuote)
        finalPrice = try container.decodeIfPresent(Double.self, forKey: .finalPrice)
        amountPaid = try container.decodeIfPresent(Double.self, forKey: .amountPaid)
        paymentType = try container.decodeIfPresent(String.self, forKey: .paymentType)
        deliveryOfItem = try container.decodeIfPresent(String.self, forKey: .deliveryOfItem)
        requestorType = try container.decodeIfPresent(String.self, forKey: .requestorType)
        firstName = try container.decodeIfPresent(String.self, forKey: .firstName)
        lastName = try container.decodeIfPresent(String.self, forKey: .lastName)
        telephone = try container.decodeIfPresent(String.self, forKey: .telephone)
        email = try container.decodeIfPresent(String.self, forKey: .email)
        referredBy = try container.decodeIfPresent(String.self, forKey: .referredBy)
        submittedOn = try container.decodeIfPresent(String.self, forKey: .submittedOn)
        createdOn = try container.decodeIfPresent(String.self, forKey: .createdOn)
        weight = try container.decodeIfPresent(Double.self, forKey: .weight)
        dateForZapier = try container.decodeIfPresent(String.self, forKey: .dateForZapier)
        sendPriceEmail = try container.decodeIfPresent(String.self, forKey: .sendPriceEmail)
        sentEmail = try container.decodeIfPresent(Bool.self, forKey: .sentEmail)
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encodeIfPresent(repairID, forKey: .repairID)
        try container.encodeIfPresent(owner, forKey: .owner)
        try container.encodeIfPresent(internalNotes, forKey: .internalNotes)
        try container.encodeIfPresent(dateQuoted, forKey: .dateQuoted)
        try container.encodeIfPresent(status, forKey: .status)
        try container.encodeIfPresent(typeOfItem, forKey: .typeOfItem)
        try container.encodeIfPresent(brand, forKey: .brand)
        try container.encodeIfPresent(color, forKey: .color)
        try container.encodeIfPresent(damageDescription, forKey: .damageDescription)
        try container.encodeIfPresent(photoURL, forKey: .photoURL)
        try container.encodeIfPresent(priceQuote, forKey: .priceQuote)
        try container.encodeIfPresent(finalPrice, forKey: .finalPrice)
        try container.encodeIfPresent(amountPaid, forKey: .amountPaid)
        try container.encodeIfPresent(paymentType, forKey: .paymentType)
        try container.encodeIfPresent(deliveryOfItem, forKey: .deliveryOfItem)
        try container.encodeIfPresent(requestorType, forKey: .requestorType)
        try container.encodeIfPresent(firstName, forKey: .firstName)
        try container.encodeIfPresent(lastName, forKey: .lastName)
        try container.encodeIfPresent(telephone, forKey: .telephone)
        try container.encodeIfPresent(email, forKey: .email)
        try container.encodeIfPresent(referredBy, forKey: .referredBy)
        try container.encodeIfPresent(submittedOn, forKey: .submittedOn)
        try container.encodeIfPresent(createdOn, forKey: .createdOn)
        try container.encodeIfPresent(weight, forKey: .weight)
        try container.encodeIfPresent(dateForZapier, forKey: .dateForZapier)
        try container.encodeIfPresent(sendPriceEmail, forKey: .sendPriceEmail)
        try container.encodeIfPresent(sentEmail, forKey: .sentEmail)
    }

    struct OwnerInfo: Codable {
        var id: String?
        var email: String?
        var name: String?

        init(id: String? = nil, email: String? = nil, name: String? = nil) {
            self.id = id
            self.email = email
            self.name = name
        }

        init(from decoder: Decoder) throws {
            let container = try decoder.singleValueContainer()
            if let ownerDict = try? container.decode([String: String?].self) {
                id = ownerDict["id"] ?? nil
                email = ownerDict["email"] ?? nil
                name = ownerDict["name"] ?? nil
            }
            else if let ownerString = try? container.decode(String.self) {
                name = ownerString
                id = nil
                email = nil
            } else {
                id = nil
                email = nil
                name = nil
            }
        }

        func encode(to encoder: Encoder) throws {
            var container = encoder.singleValueContainer()
            if let name = name {
                try container.encode(name)
            } else {
                try container.encodeNil()
            }
        }
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
}
