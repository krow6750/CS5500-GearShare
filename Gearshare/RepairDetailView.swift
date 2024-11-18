//
//  RepairDetailView.swift
//  Gearshare
//
//  Created by Comus Hardman IV on 10/15/24.
//
import SwiftUI

struct RepairDetailView: View {
    var repair: RepairItem
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading) {
                if let owner = repair.owner {
                    Text("Owner: \(owner.name ?? "")")
                    Text("Email: \(owner.email ?? "")")
                }
                Divider()
                
                Text("Repair ID: \(repair.repairID ?? "")")
                Text("First Name: \(repair.firstName ?? "")")
                Text("Last Name: \(repair.lastName ?? "")")
                Text("Status: \(repair.status ?? "")")
                Divider()
                
                Text("Item Type: \(repair.typeOfItem ?? "")")
                Text("Brand: \(repair.brand ?? "")")
                Text("Color: \(repair.color ?? "")")
                Divider()
                
                Text("Damage Description:")
                Text(repair.damageDescription ?? "")
                Divider()
                
                if let priceQuote = repair.priceQuote {
                    Text("Price Quote: $\(priceQuote)")
                }
                if let finalPrice = repair.finalPrice {
                    Text("Final Price: $\(finalPrice)")
                }
                if let amountPaid = repair.amountPaid {
                    Text("Amount Paid: $\(amountPaid)")
                }
                Divider()
                
                Text("Payment Type: \(repair.paymentType ?? "")")
                Text("Delivery Method: \(repair.deliveryOfItem ?? "")")
                Text("Requestor Type: \(repair.requestorType ?? "")")
                Divider()
                
                Text("Telephone: \(repair.telephone ?? "")")
                Text("Email: \(repair.email ?? "")")
                Divider()
                
                if let weight = repair.weight {
                    Text("Weight: \(weight) ounces")
                }
                
                if let photoURLString = repair.photoURL, let photoURL = URL(string: photoURLString) {
                    AsyncImage(url: photoURL) { image in
                        image.resizable()
                            .scaledToFit()
                            .frame(height: 200)
                    } placeholder: {
                        ProgressView()
                    }
                }
            }
            .padding()
        }
        .navigationBarTitle("Repair Details")
    }
}

#Preview {
    RepairDetailView(repair: RepairItem())
}
