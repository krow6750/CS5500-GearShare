//
//  NewRepairView.swift
//  Gearshare
//
//  Created by Comus Hardman IV on 10/15/24.
//
import SwiftUI

struct NewRepairView: View {
    @Environment(\.presentationMode) var presentationMode
    @State var ownerName = ""
    @State var firstName = ""
    @State var lastName = ""
    @State var typeOfItem = ""
    @State var damageDescription = ""
    @State var priceQuote = ""
    @State var finalPrice = ""
    @State var email = ""
    @State var status = ""
    @State var weight = ""
    @State var internalNotes = ""
    let airtableAPI = AirtableAPI()
    
    var body: some View {
        NavigationView {
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
                TextField("Weight", text: $weight)
                TextField("Internal Notes", text: $internalNotes)
                Button("Save") {
                    let newRepair = RepairItem(
                        owner: RepairItem.OwnerInfo(email: email, name: ownerName),
                        internalNotes: internalNotes,
                        status: status,
                        typeOfItem: typeOfItem,
                        damageDescription: damageDescription,
                        priceQuote: Double(priceQuote),
                        finalPrice: Double(finalPrice),
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                        weight: Double(weight)
                    )
                    airtableAPI.createRepair(newRepair) {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
            }
            .navigationBarTitle("New Repair")
            .navigationBarItems(trailing:
                Button("Cancel") {
                    presentationMode.wrappedValue.dismiss()
                }
            )
        }
    }
}
