// 'use client';

// import { useState, useEffect } from 'react';
// import { Dialog } from '@headlessui/react';
// import { firebaseDB } from '@/lib/firebase/db';
// import { COLLECTIONS, STATUS } from '@/lib/firebase/models';
// import { booqableService } from '@/lib/booqable/booqableService';
// import { useActivityLog } from '@/hooks/useActivityLog';
// import { MagnifyingGlassIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
// import { where, limit } from 'firebase/firestore';
// import { collection, query, getDocs } from 'firebase/firestore';
// import { db } from '../../lib/firebase/firebase-config.js';

// // Common styles
// const inputStyles = `
//   w-full 
//   rounded-md 
//   border 
//   border-slate-300
//   bg-white
//   py-2.5 
//   px-3 
//   text-base 
//   text-slate-900 
//   placeholder:text-slate-500 
//   shadow-sm
//   hover:border-slate-400 
//   focus:border-slate-500 
//   focus:outline-none 
//   focus:ring-2 
//   focus:ring-slate-200
// `;

// const labelStyles = "block text-base font-medium text-slate-900 mb-2";

// // SearchableSelect Component
// function SearchableSelect({ options, value, onChange, label, placeholder, renderOption }) {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isOpen, setIsOpen] = useState(false);

//   const filteredOptions = options.filter(option => 
//     renderOption(option).toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const selectedOption = options.find(opt => opt.id === value);

//   useEffect(() => {
//     if (selectedOption) {
//       setSearchTerm(renderOption(selectedOption));
//     }
//   }, [selectedOption]);

//   return (
//     <div className="relative">
//       <label className={labelStyles}>{label}</label>
      
//       <div className="relative">
//         <input
//           type="text"
//           className={inputStyles}
//           placeholder={placeholder}
//           value={searchTerm}
//           onChange={(e) => {
//             setSearchTerm(e.target.value);
//             setIsOpen(true);
//           }}
//           onFocus={() => setIsOpen(true)}
//         />
//         <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute right-3 top-2.5" />
//       </div>

//       {isOpen && filteredOptions.length > 0 && (
//         <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 overflow-auto focus:outline-none border border-slate-300">
//           {filteredOptions.map((option) => (
//             <div
//               key={option.id}
//               className={`cursor-pointer select-none relative py-2.5 px-3 text-base hover:bg-slate-50 ${
//                 value === option.id ? 'bg-slate-50 text-slate-900 font-medium' : 'text-slate-900'
//               }`}
//               onClick={() => {
//                 onChange(option.id);
//                 setSearchTerm(renderOption(option));
//                 setIsOpen(false);
//               }}
//             >
//               {renderOption(option)}
//             </div>
//           ))}
//         </div>
//       )}

//       {!isOpen && selectedOption && (
//         <div className="mt-2 px-3 py-2 text-base text-slate-900 bg-slate-50 border border-slate-200 rounded-md flex items-center gap-2">
//           <div className="text-sm text-slate-500">Selected:</div>
//           <div className="font-medium">{renderOption(selectedOption)}</div>
//         </div>
//       )}
//     </div>
//   );
// }

// // CustomerSearch Component
// function CustomerSearch({ onSelect, initialCustomer, onFormVisibilityChange }) {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [results, setResults] = useState([]);
//   const [error, setError] = useState(null);
//   const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
//   const [newCustomer, setNewCustomer] = useState({
//     name: '',
//     email: '',
//     phone: ''
//   });

//   // Show initial customer data
//   useEffect(() => {
//     if (initialCustomer) {
//       setSearchTerm(''); // Clear search term to not show the search results
//       onSelect(initialCustomer); // Make sure the parent component has the customer data
//     }
//   }, [initialCustomer]);

//   // Search functionality
//   useEffect(() => {
//     const searchCustomers = async () => {
//       if (!searchTerm || searchTerm.length < 3) {
//         setResults([]);
//         return;
//       }

//       setIsLoading(true);
//       try {
//         const usersRef = collection(db, 'users');
//         const querySnapshot = await getDocs(usersRef);
        
//         const customers = [];
//         querySnapshot.forEach((doc) => {
//           const data = doc.data();
//           if (data.email?.toLowerCase().includes(searchTerm.toLowerCase())) {
//             customers.push({
//               id: doc.id,
//               ...data
//             });
//           }
//         });

//         setResults(customers);
//       } catch (error) {
//         console.error('Search error:', error);
//         setError(`Search failed: ${error.message}`);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     const timer = setTimeout(searchCustomers, 500);
//     return () => clearTimeout(timer);
//   }, [searchTerm]);

//   // Handle creating new customer
//   const handleCreateCustomer = async (e) => {
//     e?.preventDefault();
    
//     if (!newCustomer.name || !newCustomer.email) {
//       setError('Name and email are required');
//       return;
//     }

//     setIsLoading(true);
//     setError(null);

//     try {
//       const customerData = {
//         name: newCustomer.name,
//         email: newCustomer.email.toLowerCase(),
//         phone: newCustomer.phone || '',
//         created_at: new Date().toISOString(),
//         status: 'active'
//       };

//       const createdCustomer = await firebaseDB.create('users', customerData);
//       onSelect(createdCustomer);
      
//       setShowNewCustomerForm(false);
//       setNewCustomer({ name: '', email: '', phone: '' });
//       setSearchTerm('');
//     } catch (error) {
//       console.error('Failed to create customer:', error);
//       setError(error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     onFormVisibilityChange?.(showNewCustomerForm);
//   }, [showNewCustomerForm]);

//   return (
//     <div className="space-y-4">
//       {!showNewCustomerForm ? (
//         <div className="space-y-3">
//           <div className="relative">
//             <input
//               type="email"
//               placeholder="Search by email..."
//               className={inputStyles}
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//             {isLoading && (
//               <div className="absolute right-2 top-2">Loading...</div>
//             )}
//           </div>

//           {error && (
//             <div className="text-red-500 text-sm">{error}</div>
//           )}

//           {results.length > 0 && (
//             <div className="border rounded-md divide-y">
//               {results.map(customer => (
//                 <div
//                   key={customer.id}
//                   className="p-3 hover:bg-slate-50 cursor-pointer"
//                   onClick={() => {
//                     onSelect(customer);
//                     setSearchTerm('');
//                     setResults([]);
//                   }}
//                 >
//                   <div className="font-medium">{customer.name}</div>
//                   <div className="text-sm text-slate-600">{customer.email}</div>
//                 </div>
//               ))}
//             </div>
//           )}

//           <button
//             type="button"
//             className="flex items-center text-slate-900 hover:text-slate-700"
//             onClick={() => {
//               setShowNewCustomerForm(true);
//               onFormVisibilityChange?.(true);
//             }}
//           >
//             <PlusCircleIcon className="h-5 w-5 mr-1" />
//             Create New Customer
//           </button>
//         </div>
//       ) : (
//         <div className="space-y-3">
//           <h3 className="font-medium text-slate-900">Create New Customer</h3>
          
//           <div>
//             <label className={labelStyles}>Name</label>
//             <input
//               type="text"
//               required
//               className={inputStyles}
//               value={newCustomer.name}
//               onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
//             />
//           </div>
          
//           <div>
//             <label className={labelStyles}>Email</label>
//             <input
//               type="email"
//               required
//               className={inputStyles}
//               value={newCustomer.email}
//               onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
//             />
//           </div>
          
//           <div>
//             <label className={labelStyles}>Phone</label>
//             <input
//               type="tel"
//               className={inputStyles}
//               value={newCustomer.phone}
//               onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
//             />
//           </div>

//           {error && (
//             <div className="text-red-600 text-sm">{error}</div>
//           )}

//           <div className="flex space-x-3">
//             <button
//               type="button"
//               onClick={handleCreateCustomer}
//               disabled={isLoading}
//               className="px-4 py-2.5 text-base font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50 transition-colors"
//             >
//               {isLoading ? 'Creating...' : 'Create Customer'}
//             </button>
//             <button
//               type="button"
//               onClick={() => {
//                 setShowNewCustomerForm(false);
//                 onFormVisibilityChange?.(false);
//                 setNewCustomer({ name: '', email: '', phone: '' });
//                 setError(null);
//               }}
//               className="px-4 py-2.5 text-base font-medium text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// // Main EditRentalModal Component
// export default function EditRentalModal({ isOpen, onClose, rental, onSuccess }) {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [equipment, setEquipment] = useState([]);
//   const [selectedCustomer, setSelectedCustomer] = useState(null);
//   const [totalDays, setTotalDays] = useState(0);
//   const { logActivity } = useActivityLog();
  
//   const [formData, setFormData] = useState({
//     start_date: '',
//     end_date: '',
//     quantity: 1,
//     status: STATUS.RENTAL.ACTIVE
//   });

//   const [selectedEquipment, setSelectedEquipment] = useState(null);

//   // Add state to track new customer form visibility
//   const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

//   // Load equipment and initialize form data
//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const equipmentData = await firebaseDB.query(COLLECTIONS.EQUIPMENT);
//         setEquipment(equipmentData);
//       } catch (error) {
//         console.error('Error loading equipment:', error);
//         setError('Failed to load equipment');
//       }
//     };
//     loadData();
//   }, []);

//   // Initialize form with rental data
//   useEffect(() => {
//     if (rental) {
//       const formattedStartDate = rental.start_date ? new Date(rental.start_date).toISOString().split('T')[0] : '';
//       const formattedEndDate = rental.end_date ? new Date(rental.end_date).toISOString().split('T')[0] : '';

//       setFormData({
//         start_date: formattedStartDate,
//         end_date: formattedEndDate,
//         quantity: parseInt(rental.quantity) || 1,
//         status: rental.status
//       });

//       // Set the initial customer data
//       if (rental.user_id) {
//         setSelectedCustomer({
//           id: rental.user_id,
//           name: rental.customer_name,
//           email: rental.customer_email,
//           phone: rental.customer_phone // if available
//         });
//       }

//       // Set the selected equipment
//       const rentalEquipment = equipment.find(e => e.id === rental.equipment_id);
//       setSelectedEquipment(rentalEquipment);
//     }
//   }, [rental, equipment]);

//   // Calculate total days and cost
//   useEffect(() => {
//     if (formData.start_date && formData.end_date) {
//       const start = new Date(formData.start_date);
//       const end = new Date(formData.end_date);
//       const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
//       setTotalDays(days);
//     }
//   }, [formData.start_date, formData.end_date]);

//   const totalCost = selectedEquipment ? 
//     (selectedEquipment.price * formData.quantity * totalDays) : 0;

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       if (!selectedCustomer?.id) {
//         throw new Error('Please select a customer');
//       }

//       if (!selectedEquipment) {
//         throw new Error('Equipment data not loaded');
//       }

//       // Update Firebase rental
//       const updateData = {
//         equipment_id: selectedEquipment.id,
//         user_id: selectedCustomer.id,
//         start_date: formData.start_date,
//         end_date: formData.end_date,
//         total_cost: totalCost,
//         status: formData.status,
//         quantity: parseInt(formData.quantity) || 1,
//         last_updated: new Date().toISOString(),
//         customer_name: selectedCustomer.name,
//         customer_email: selectedCustomer.email,
//         equipment_name: selectedEquipment.name
//       };

//       // Update Booqable if ID exists
//       if (rental.booqableId) {
//         const booqableData = {
//           id: rental.booqableId,
//           start_date: formData.start_date,
//           end_date: formData.end_date,
//           customer_name: selectedCustomer.name,
//           customer_email: selectedCustomer.email,
//           equipment_booqable_id: selectedEquipment.booqableId,
//           quantity: parseInt(formData.quantity) || 1,
//           status: formData.status
//         };

//         await booqableService.updateRental(booqableData);
//       }

//       await firebaseDB.update(COLLECTIONS.RENTALS, rental.id, updateData);

//       // Log activity with the exact structure from AddRentalModal
//       const activityLogData = {
//         log_id: Date.now(),
//         activity_time: new Date().toISOString(),
//         user_id: selectedCustomer.id,
//         action_type: {
//           type: 'RENTAL_UPDATED',
//           action: 'update',
//           description: `Updated rental for ${selectedCustomer.name}`,
//           details: JSON.stringify({
//             rental_id: rental.id,
//             changes: {
//               previous: {
//                 start_date: rental.start_date || '',
//                 end_date: rental.end_date || '',
//                 quantity: rental.quantity || 1,
//                 status: rental.status || '',
//                 customer_id: rental.user_id || '',
//                 equipment_id: rental.equipment_id || ''
//               },
//               current: {
//                 start_date: formData.start_date || '',
//                 end_date: formData.end_date || '',
//                 quantity: formData.quantity || 1,
//                 status: formData.status || '',
//                 customer_id: selectedCustomer.id || '',
//                 equipment_id: selectedEquipment.id || ''
//               }
//             }
//           })
//         },
//         description: `Updated rental for ${selectedCustomer.name}`
//       };

//       await logActivity(activityLogData);

//       onSuccess?.();
//       onClose?.();
//     } catch (error) {
//       console.error('Failed to update rental:', error);
//       setError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCustomerSelect = (customer) => {
//     setSelectedCustomer(customer);
//   };

//   return (
//     <Dialog open={isOpen} onClose={onClose} className="relative z-50">
//       <div className="fixed inset-0 bg-slate-900/30" aria-hidden="true" />
      
//       <div className="fixed inset-0 flex items-center justify-center p-4">
//         <Dialog.Panel className="mx-auto max-w-md rounded-lg bg-white p-5 shadow-lg">
//           <Dialog.Title className="text-lg font-semibold text-slate-900 mb-4">
//             Edit Rental #{rental?.rental_id}
//           </Dialog.Title>

//           {error && (
//             <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-slate-900 mb-1.5">
//                 Equipment
//               </label>
//               {selectedEquipment && (
//                 <div className="mt-1.5 px-3 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-md flex items-center gap-2">
//                   <div className="text-xs text-slate-500">Selected:</div>
//                   <div className="font-medium">
//                     {selectedEquipment.name} - ${selectedEquipment.price}/day
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-slate-900 mb-1.5">
//                 Customer
//               </label>
//               <CustomerSearch 
//                 onSelect={handleCustomerSelect} 
//                 initialCustomer={selectedCustomer}
//                 onFormVisibilityChange={(isVisible) => setIsCreatingCustomer(isVisible)}
//               />
//               {selectedCustomer && !isCreatingCustomer && (
//                 <div className="mt-1.5 px-3 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-md">
//                   <p className="font-medium">{selectedCustomer.name}</p>
//                   <p className="text-xs text-slate-600">{selectedCustomer.email}</p>
//                 </div>
//               )}
//             </div>

//             {!isCreatingCustomer && (
//               <>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <label className="block text-sm font-medium text-slate-900 mb-1.5">
//                       Start Date
//                     </label>
//                     <input
//                       type="date"
//                       required
//                       className="w-full rounded-md border border-slate-300 bg-white py-1.5 px-2.5 text-sm"
//                       value={formData.start_date}
//                       onChange={(e) => setFormData({...formData, start_date: e.target.value})}
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-slate-900 mb-1.5">
//                       End Date
//                     </label>
//                     <input
//                       type="date"
//                       required
//                       className="w-full rounded-md border border-slate-300 bg-white py-1.5 px-2.5 text-sm"
//                       value={formData.end_date}
//                       min={formData.start_date}
//                       onChange={(e) => setFormData({...formData, end_date: e.target.value})}
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-900 mb-1.5">
//                     Quantity
//                   </label>
//                   <input
//                     type="number"
//                     required
//                     min="1"
//                     className="w-full rounded-md border border-slate-300 bg-white py-1.5 px-2.5 text-sm"
//                     value={formData.quantity || 1}
//                     onChange={(e) => {
//                       const newValue = parseInt(e.target.value) || 1;
//                       setFormData(prev => ({
//                         ...prev,
//                         quantity: Math.max(1, newValue)
//                       }));
//                     }}
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-900 mb-1.5">
//                     Status
//                   </label>
//                   <select
//                     required
//                     className="w-full rounded-md border border-slate-300 bg-white py-1.5 px-2.5 text-sm"
//                     value={formData.status}
//                     onChange={(e) => setFormData({...formData, status: e.target.value})}
//                   >
//                     <option value={STATUS.RENTAL.ACTIVE}>Active</option>
//                     <option value={STATUS.RENTAL.COMPLETED}>Completed</option>
//                     <option value={STATUS.RENTAL.OVERDUE}>Overdue</option>
//                     <option value={STATUS.RENTAL.CANCELLED}>Cancelled</option>
//                   </select>
//                 </div>

//                 {totalCost > 0 && (
//                   <div className="bg-slate-50 p-3 rounded-md border border-slate-200 text-sm">
//                     <p className="text-slate-900">Duration: {totalDays} days</p>
//                     <p className="font-semibold text-slate-900 mt-0.5">
//                       Total Cost: ${totalCost.toFixed(2)}
//                     </p>
//                   </div>
//                 )}

//                 <div className="flex justify-end space-x-3 mt-4">
//                   <button
//                     type="button"
//                     onClick={onClose}
//                     className="px-3 py-1.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="px-3 py-1.5 text-sm font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50"
//                   >
//                     {loading ? 'Saving...' : 'Save Changes'}
//                   </button>
//                 </div>
//               </>
//             )}
//           </form>
//         </Dialog.Panel>
//       </div>
//     </Dialog>
//   );
// }