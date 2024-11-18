//
//  EditRepairView.swift
//  Gearshare
//
//  Created by Comus Hardman IV on 10/15/24.
//

import SwiftUI

struct EditRepairView: View {
    @Environment(\.presentationMode) var presentationMode
    @Binding var repair: RepairItem
    var recordID: String
    @State var ownerName: String
    @State var firstName: String
    @State var lastName: String
    @State var typeOfItem: String
    @State var damageDescription: String
    @State var priceQuote: String
    @State var finalPrice: String
    @State var email: String
    @State var status: String
    let airtableAPI = AirtableAPI()
    
    init(repair: Binding<RepairItem>, recordID: String) {
        self._repair = repair
        self.recordID = recordID
        _ownerName = State(initialValue: repair.wrappedValue.owner?.name ?? "")
        _firstName = State(initialValue: repair.wrappedValue.firstName ?? "")
        _lastName = State(initialValue: repair.wrappedValue.lastName ?? "")
        _typeOfItem = State(initialValue: repair.wrappedValue.typeOfItem ?? "")
        _damageDescription = State(initialValue: repair.wrappedValue.damageDescription ?? "")
        _priceQuote = State(initialValue: "\(repair.wrappedValue.priceQuote ?? 0.0)")
        _finalPrice = State(initialValue: "\(repair.wrappedValue.finalPrice ?? 0.0)")
        _email = State(initialValue: repair.wrappedValue.email ?? "")
        _status = State(initialValue: repair.wrappedValue.status ?? "")
    }
    
    var body: some View {
        Form {
            TextField("Owner Name", text: $ownerName)
            TextField("First Name", text: $firstName)
            TextField("Last Name", text: $lastName)
            TextField("Item Type", text: $typeOfItem)
            TextField("Damage Description", text: $damageDescription)
            TextField("Price Quote", text: $priceQuote)
            TextField("Final Price", text: $finalPrice)
            TextField("Email", text: $email)
            TextField("Status", text: $status)
            Button("Save") {
                repair.owner?.name = ownerName
                repair.firstName = firstName
                repair.lastName = lastName
                repair.typeOfItem = typeOfItem
                repair.damageDescription = damageDescription
                repair.priceQuote = Double(priceQuote)
                repair.finalPrice = Double(finalPrice)
                repair.email = email
                repair.status = status
                airtableAPI.updateRepair(repair: repair, recordID: recordID) {
                    presentationMode.wrappedValue.dismiss()
                }
            }
        }
    }
}
