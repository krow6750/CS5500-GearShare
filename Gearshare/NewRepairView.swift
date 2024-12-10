//
//  NewRepairView.swift
//  Gearshare
//
//  Created by Comus Hardman IV on 10/15/24.
//


import SwiftUI

struct NewRepairView: View {
    @Environment(\.presentationMode) var presentationMode
    @State var ownerName: String = ""
    @State var firstName: String = ""
    @State var lastName: String = ""
    @State var typeOfItem: String = ""
    @State var damageDescription: String = ""
    @State var priceQuote: String = ""
    @State var finalPrice: String = ""
    @State var email: String = ""
    @State var status: String = ""
    @State var weight: String = ""
    @State var internalNotes: String = ""
    @State var sentEmail: Bool = false
    let airtableAPI = AirtableAPI()

    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Repair Details")) {
                    TextField("Owner Name", text: $ownerName)
                    TextField("First Name", text: $firstName)
                    TextField("Last Name", text: $lastName)
                    TextField("Item Type", text: $typeOfItem)
                    TextField("Damage Description", text: $damageDescription)
                    TextField("Price Quote", text: $priceQuote)
                        .keyboardType(.decimalPad)
                    TextField("Final Price", text: $finalPrice)
                        .keyboardType(.decimalPad)
                    TextField("Email", text: $email)
                    TextField("Status", text: $status)
                    TextField("Weight (Ounces)", text: $weight)
                        .keyboardType(.decimalPad)
                    TextField("Internal Notes", text: $internalNotes)
                    Toggle("Sent Email", isOn: $sentEmail)
                }

                Section {
                    Button(action: saveRepair) {
                        Text("Save Repair")
                    }
                }
            }
            .navigationTitle("New Repair")
            .navigationBarItems(trailing: Button("Cancel") {
                presentationMode.wrappedValue.dismiss()
            })
        }
    }

    func saveRepair() {
        let priceQuoteValue = Double(priceQuote) ?? 0.0
        let finalPriceValue = Double(finalPrice) ?? 0.0
        let weightValue = Double(weight) ?? 0.0

        let newRepair = RepairItem(
            repairID: nil,
            owner: RepairItem.OwnerInfo(id: nil, email: email.isEmpty ? nil : email, name: ownerName.isEmpty ? nil : ownerName),
            internalNotes: internalNotes.isEmpty ? nil : internalNotes,
            dateQuoted: nil,
            status: status.isEmpty ? nil : status,
            typeOfItem: typeOfItem.isEmpty ? nil : typeOfItem,
            brand: nil,
            color: nil,
            damageDescription: damageDescription.isEmpty ? nil : damageDescription,
            photoURL: nil,
            photoAttachments: nil,
            priceQuote: priceQuoteValue != 0.0 ? priceQuoteValue : nil,
            finalPrice: finalPriceValue != 0.0 ? finalPriceValue : nil,
            amountPaid: nil,
            paymentType: nil,
            deliveryOfItem: nil,
            requestorType: nil,
            firstName: firstName.isEmpty ? nil : firstName,
            lastName: lastName.isEmpty ? nil : lastName,
            telephone: nil,
            email: email.isEmpty ? nil : email,
            referredBy: nil,
            submittedOn: nil,
            createdOn: nil,
            weight: weightValue != 0.0 ? weightValue : nil,
            dateForZapier: nil,
            sendPriceEmail: nil,
            sentEmail: sentEmail
        )

        airtableAPI.createRepair(newRepair) {
            DispatchQueue.main.async {
                print("Repair successfully created.")
                presentationMode.wrappedValue.dismiss()
            }
        }
    }
}
