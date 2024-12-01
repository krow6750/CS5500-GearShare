'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { MagnifyingGlassIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import booqableService from '@/lib/booqable/booqableService';

// Common styles with better borders and contrast
const inputStyles = `
  w-full 
  rounded-md 
  border 
  border-slate-300
  bg-white
  py-2.5 
  px-3 
  text-base 
  text-slate-900 
  placeholder:text-slate-500 
  shadow-sm
  hover:border-slate-400 
  focus:border-slate-500 
  focus:outline-none 
  focus:ring-2 
  focus:ring-slate-200
`;

const labelStyles = "block text-base font-medium text-slate-900 mb-2";

// Search Input Component
function SearchableSelect({ 
  options, 
  value, 
  onChange, 
  label, 
  placeholder,
  renderOption 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = options.filter(option => 
    renderOption(option).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.id === value);

  return (
    <div className="relative">
      <label className={labelStyles}>{label}</label>
      
      <div className="relative">
        <input
          type="text"
          className={inputStyles}
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute right-3 top-2.5" />
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 overflow-auto focus:outline-none border border-slate-300">
          {filteredOptions.map((option) => (
            <div
              key={option.id}
              className={`cursor-pointer select-none relative py-2.5 px-3 text-base hover:bg-slate-50 ${
                value === option.id ? 'bg-slate-50 text-slate-900 font-medium' : 'text-slate-900'
              }`}
              onClick={() => {
                onChange(option.id);
                setSearchTerm(renderOption(option));
                setIsOpen(false);
              }}
            >
              {renderOption(option)}
            </div>
          ))}
        </div>
      )}

      {!isOpen && selectedOption && (
        <div className="mt-2 px-3 py-2 text-base text-slate-900 bg-slate-50 border border-slate-200 rounded-md flex items-center gap-2">
          <div className="text-sm text-slate-500">Selected:</div>
          <div className="font-medium">{renderOption(selectedOption)}</div>
        </div>
      )}
    </div>
  );
}

function CustomerSearch({ onSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const handleCustomerSelection = (customer) => {
    setSelectedCustomer(customer);
    onSelect(customer);
    setSearchTerm('');
    setResults([]);
  };

  const handleCreateCustomer = async (e) => {
    e?.preventDefault();
    
    if (!newCustomer.name || !newCustomer.email) {
      setError('Name and email are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create customer in Booqable
      const customerData = {
        name: newCustomer.name,
        email: newCustomer.email.toLowerCase(),
        phone: newCustomer.phone || ''
      };

      console.log('Creating new customer:', customerData);
      const createdCustomer = await booqableService.createCustomer(customerData);
      console.log('Customer created:', createdCustomer);

      // Select the new customer
      handleCustomerSelection(createdCustomer);
      
      // Reset form and close modal
      setShowNewCustomerForm(false);
      setNewCustomer({ name: '', email: '', phone: '' });
      setSearchTerm('');
    } catch (error) {
      console.error('Failed to create customer:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Add search functionality
  useEffect(() => {
    const searchCustomers = async () => {
      if (!searchTerm || searchTerm.length < 3) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const usersRef = collection(db, COLLECTIONS.USERS);
        const q = query(
          usersRef,
          where('email', '>=', searchTerm.toLowerCase()),
          where('email', '<=', searchTerm.toLowerCase() + '\uf8ff'),
          limit(5)
        );

        const querySnapshot = await getDocs(q);
        const customers = [];
        querySnapshot.forEach((doc) => {
          customers.push({ id: doc.id, ...doc.data() });
        });

        setResults(customers);
      } catch (error) {
        console.error('Error searching customers:', error);
        setError('Failed to search customers');
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchCustomers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  return (
    <div className="space-y-4">
      {!selectedCustomer ? (
        <div className="space-y-3">
          <div className="relative">
            <input
              type="email"
              placeholder="Search by email..."
              className={inputStyles}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {isLoading && (
              <div className="absolute right-2 top-2">
                <svg className="animate-spin h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}

          {results.length > 0 && (
            <div className="border rounded-md divide-y divide-slate-200 bg-white shadow-sm">
              {results.map(customer => (
                <div
                  key={customer.id}
                  className="p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => handleCustomerSelection(customer)}
                >
                  <div className="font-medium text-slate-900">{customer.name}</div>
                  <div className="text-sm text-slate-600">{customer.email}</div>
                </div>
              ))}
            </div>
          )}

          {searchTerm.length >= 3 && results.length === 0 && !isLoading && (
            <div className="text-sm text-slate-600">
              No customers found. Create a new one?
            </div>
          )}

          <button
            type="button"
            className="flex items-center text-slate-700 hover:text-slate-900"
            onClick={() => setShowNewCustomerForm(true)}
          >
            <PlusCircleIcon className="h-5 w-5 mr-1" />
            Create New Customer
          </button>
        </div>
      ) : (
        <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
          <div className="font-medium text-slate-900">{selectedCustomer.name}</div>
          <div className="text-sm text-slate-600">{selectedCustomer.email}</div>
          <button
            type="button"
            className="mt-2 text-sm text-slate-600 hover:text-slate-900"
            onClick={() => {
              setSelectedCustomer(null);
              setSearchTerm('');
            }}
          >
            Change Customer
          </button>
        </div>
      )}

      {/* New Customer Modal */}
      <Dialog open={showNewCustomerForm} onClose={() => setShowNewCustomerForm(false)} className="relative z-[60]">
        <div className="fixed inset-0 bg-slate-900/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md w-full rounded-lg bg-white p-6 shadow-lg">
            <Dialog.Title className="text-xl font-semibold text-slate-900 mb-6">
              Create New Customer
            </Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className={labelStyles}>Name</label>
                <input
                  type="text"
                  required
                  className={inputStyles}
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className={labelStyles}>Email</label>
                <input
                  type="email"
                  required
                  className={inputStyles}
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                />
              </div>
              
              <div>
                <label className={labelStyles}>Phone</label>
                <input
                  type="tel"
                  className={inputStyles}
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCustomerForm(false);
                    setNewCustomer({ name: '', email: '', phone: '' });
                    setError(null);
                  }}
                  className="px-4 py-2.5 text-base font-medium text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateCustomer}
                  disabled={isLoading}
                  className="px-4 py-2.5 text-base font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Creating...' : 'Create Customer'}
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}

export default function AddRentalModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [equipment, setEquipment] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [totalDays, setTotalDays] = useState(0);
  
  const [formData, setFormData] = useState({
    selectedEquipment: '',
    start_date: '',
    end_date: '',
    quantity: '1'
  });

  // Load equipment on mount
  useEffect(() => {
    const loadEquipment = async () => {
      try {
        const equipmentData = await booqableService.fetchAllProducts();
        console.log('Loaded equipment:', equipmentData);
        setEquipment(equipmentData);
      } catch (error) {
        console.error('Error loading equipment:', error);
        setError('Failed to load equipment');
      }
    };
    loadEquipment();
  }, []);

  // Calculate total days when dates change
  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      setTotalDays(days);
    }
  }, [formData.start_date, formData.end_date]);

  // Calculate total cost
  const selectedEquipment = equipment.find(e => e.id === formData.selectedEquipment);
  const totalCost = selectedEquipment ? 
    (selectedEquipment.base_price_in_cents / 100 * (parseInt(formData.quantity) || 0) * totalDays) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Validate quantity
    const quantity = parseInt(formData.quantity);
    if (!quantity || quantity < 1) {
      setError('Please enter a valid quantity');
      setLoading(false);
      return;
    }

    try {
      if (!selectedCustomer) {
        throw new Error('Please select a customer');
      }

      // First, ensure the customer exists in Booqable
      let booqableCustomer;
      try {
        booqableCustomer = await booqableService.fetchCustomerById(selectedCustomer.id);
      } catch (error) {
        // If customer doesn't exist in Booqable, create them
        console.log('Creating new customer in Booqable');
        booqableCustomer = await booqableService.createCustomer({
          name: selectedCustomer.name,
          email: selectedCustomer.email
        });
      }

      // Create rental order in Booqable
      const rentalData = {
        data: {
          type: "orders",
          attributes: {
            starts_at: new Date(formData.start_date).toISOString(),
            stops_at: new Date(formData.end_date).toISOString(),
            customer_id: booqableCustomer.id,
            lines: [{
              product_id: formData.selectedEquipment,
              quantity: quantity
            }]
          }
        }
      };

      console.log('Creating Booqable order:', rentalData);
      const booqableOrder = await booqableService.createRental(rentalData);
      console.log('Booqable order created:', booqableOrder);

      // Reset form
      setFormData({
        selectedEquipment: '',
        start_date: '',
        end_date: '',
        quantity: '1'
      });
      setSelectedCustomer(null);

      if (onSuccess) {
        onSuccess(booqableOrder);
      }
      onClose();
    } catch (error) {
      console.error('Failed to create rental:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSelect = (customer) => {
    console.log('Customer selected:', customer);
    setSelectedCustomer(customer);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-slate-900/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-lg">
          <Dialog.Title className="text-xl font-semibold text-slate-900 mb-6">
            Create New Rental
          </Dialog.Title>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <SearchableSelect
              options={equipment}
              value={formData.selectedEquipment}
              onChange={(id) => setFormData({...formData, selectedEquipment: id})}
              label="Equipment"
              placeholder="Search equipment..."
              renderOption={(item) => `${item.name} - $${item.base_price_in_cents/100}/day`}
            />

            <div>
              <label className={labelStyles}>Customer</label>
              <CustomerSearch onSelect={handleCustomerSelect} />
              {selectedCustomer && (
                <div className="mt-2 p-3 bg-slate-50 rounded-md border border-slate-200">
                  <p className="font-medium text-slate-900">{selectedCustomer.name}</p>
                  <p className="text-sm text-slate-800">{selectedCustomer.email}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelStyles}>Start Date</label>
                <input
                  type="date"
                  required
                  className={inputStyles}
                  value={formData.start_date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                />
              </div>

              <div>
                <label className={labelStyles}>End Date</label>
                <input
                  type="date"
                  required
                  className={inputStyles}
                  value={formData.end_date}
                  min={formData.start_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className={labelStyles}>Quantity</label>
              <input
                type="number"
                required
                className={inputStyles}
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              />
            </div>

            {totalCost > 0 && (
              <div className="bg-slate-50 p-4 rounded-md border border-slate-300">
                <p className="text-base text-slate-900">Duration: {totalDays} days</p>
                <p className="text-lg font-semibold text-slate-900 mt-1">
                  Total Cost: ${totalCost.toFixed(2)}
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 text-base font-medium text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2.5 text-base font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Rental'
                )}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}