'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { booqableService } from '@/lib/booqable/booqableService';
import CustomerSearch from '../customers/CustomerSearch';

export default function EditRentalModal({ isOpen, onClose, rental, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [totalDays, setTotalDays] = useState(0);
  const [equipment, setEquipment] = useState([]);

  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    quantity: '1',
    status: ''
  });

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      if (rental) {
        try {
          // Fetch order details
          const orderDetails = await booqableService.fetchOrderById(rental.id);
          
          // Fetch customer details
          const customerDetails = await booqableService.fetchCustomerById(orderDetails.customer_id);
          
          // Set form data
          setFormData({
            start_date: new Date(orderDetails.starts_at).toISOString().split('T')[0],
            end_date: new Date(orderDetails.stops_at).toISOString().split('T')[0],
            quantity: orderDetails.lines?.[0]?.quantity || 1,
            status: orderDetails.status
          });

          setSelectedCustomer(customerDetails);

          // Load equipment details if needed
          const products = await booqableService.fetchAllProducts();
          setEquipment(products);
          
          // Find selected equipment from order lines
          if (orderDetails.lines?.length > 0) {
            const productId = orderDetails.lines[0].product_id;
            const equipmentDetails = products.find(p => p.id === productId);
            setSelectedEquipment(equipmentDetails);
          }
        } catch (error) {
          console.error('Error loading rental details:', error);
          setError('Failed to load rental details');
        }
      }
    };

    loadInitialData();
  }, [rental]);

  // Calculate total days when dates change
  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      setTotalDays(Math.max(1, days));
    }
  }, [formData.start_date, formData.end_date]);

  // Calculate total cost
  const totalCost = selectedEquipment ? 
    (selectedEquipment.base_price_in_cents / 100) * parseInt(formData.quantity || 1) * totalDays : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!selectedCustomer) {
        throw new Error('Please select a customer');
      }

      // Update the order in Booqable
      const updateData = {
        starts_at: new Date(formData.start_date).toISOString(),
        stops_at: new Date(formData.end_date).toISOString(),
        status: formData.status,
        customer_id: selectedCustomer.id,
        lines: [{
          product_id: selectedEquipment.id,
          quantity: parseInt(formData.quantity) || 1
        }]
      };

      await booqableService.updateOrder(rental.id, updateData);

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error('Failed to update rental:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-slate-900/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md rounded-lg bg-white p-5 shadow-lg">
          <Dialog.Title className="text-lg font-semibold text-slate-900 mb-4">
            Edit Rental #{rental?.number}
          </Dialog.Title>

          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1.5">
                Equipment
              </label>
              {selectedEquipment && (
                <div className="mt-1.5 px-3 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-md flex items-center gap-2">
                  <div className="text-xs text-slate-500">Selected:</div>
                  <div className="font-medium">
                    {selectedEquipment.name} - ${selectedEquipment.base_price_in_cents/100}/day
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1.5">
                Customer
              </label>
              <CustomerSearch 
                onSelect={handleCustomerSelect} 
                initialCustomer={selectedCustomer}
                onFormVisibilityChange={(isVisible) => setIsCreatingCustomer(isVisible)}
              />
            </div>

            {!isCreatingCustomer && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1.5">
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full rounded-md border border-slate-300 bg-white py-1.5 px-2.5 text-sm"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1.5">
                      End Date
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full rounded-md border border-slate-300 bg-white py-1.5 px-2.5 text-sm"
                      value={formData.end_date}
                      min={formData.start_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1.5">
                    Quantity
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full rounded-md border border-slate-300 bg-white py-1.5 px-2.5 text-sm"
                    value={formData.quantity}
                    onChange={(e) => {
                      const newValue = parseInt(e.target.value) || 1;
                      setFormData(prev => ({
                        ...prev,
                        quantity: Math.max(1, newValue)
                      }));
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1.5">
                    Status
                  </label>
                  <select
                    required
                    className="w-full rounded-md border border-slate-300 bg-white py-1.5 px-2.5 text-sm"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="concept">Concept</option>
                    <option value="reserved">Reserved</option>
                    <option value="started">Started</option>
                    <option value="stopped">Stopped</option>
                    <option value="canceled">Canceled</option>
                  </select>
                </div>

                {totalCost > 0 && (
                  <div className="bg-slate-50 p-3 rounded-md border border-slate-200 text-sm">
                    <p className="text-slate-900">Duration: {totalDays} days</p>
                    <p className="font-semibold text-slate-900 mt-0.5">
                      Total Cost: ${totalCost.toFixed(2)}
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-3 py-1.5 text-sm font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </>
            )}
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}