//
//  RepairListView.swift
//  Gearshare
//
//  Created by Comus Hardman IV on 10/15/24.
//

import SwiftUI

struct RepairListView: View {
    @State var repairs: [(repair: RepairItem, id: String)] = []
    @State var isLoading = true
    @State var errorMessage: String?
    @State var showingAddRepairView = false
    @State var selectedRepair: SelectedRepair?
    let airtableAPI = AirtableAPI()
    
    var body: some View {
        NavigationView {
            VStack {
                if isLoading {
                    Text("Loading...")
                } else if repairs.isEmpty {
                    Text("No repairs")
                } else {
                    List(0..<repairs.count, id: \.self) { index in
                        let repair = repairs[index].repair
                        let recordID = repairs[index].id
                        HStack {
                            NavigationLink(destination: RepairDetailView(repair: repair)) {
                                VStack(alignment: .leading) {
                                    Text("\(repair.firstName ?? "") \(repair.lastName ?? "")")
                                        .font(.headline)
                                    Text(repair.typeOfItem ?? "")
                                        .font(.subheadline)
                                    Text("Status: \(repair.status ?? "")")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                            }
                            Spacer()
                            Button(action: {
                                selectedRepair = SelectedRepair(id: recordID, repair: repair)
                            }) {
                                Image(systemName: "pencil")
                            }
                            .buttonStyle(BorderlessButtonStyle())  // Added to prevent interference
                        }
                    }
                }
            }
            .navigationBarTitle("Repairs")
            .navigationBarItems(trailing:
                Button(action: {
                    showingAddRepairView = true
                }) {
                    Image(systemName: "plus")
                }
            )
            .onAppear {
                airtableAPI.fetchRepairs { fetchedRepairs in
                    repairs = fetchedRepairs
                    isLoading = false
                }
            }
            .sheet(isPresented: $showingAddRepairView) {
                NewRepairView()
            }
            .sheet(item: $selectedRepair) { selectedRepair in
                let index = repairs.firstIndex { $0.id == selectedRepair.id }!
                let repairBinding = Binding(
                    get: { repairs[index].repair },
                    set: { repairs[index].repair = $0 }
                )
                EditRepairView(repair: repairBinding, recordID: selectedRepair.id)
            }
        }
    }
}

struct SelectedRepair: Identifiable {
    let id: String
    var repair: RepairItem
}


