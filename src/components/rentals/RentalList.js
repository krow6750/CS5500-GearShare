'use client';

import { useState, useEffect } from 'react';
import { booqableService } from '@/lib/booqable/booqableService';
import { formatDate, formatDateOnly } from '@/lib/utils/dateFormat';
import EditRentalModal from './EditRentalModal';
import DeleteRentalModal from './DeleteRentalModal';

export default function RentalList() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRental, setSelectedRental] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Load rentals
  const loadRentals = async () => {
    try {
      setLoading(true);
      const orders = await booqableService.fetchAllOrders();
      
      // Fetch additional details for each order
      const ordersWithDetails = await Promise.all(orders.map(async (order) => {
        try {
          // Get customer details
          const customer = await booqableService.fetchCustomerById(order.customer_id);
          
          // Get product details from order lines if they exist
          let productDetails = null;
          if (order.lines && order.lines.length > 0) {
            const productId = order.lines[0].product_id;
            productDetails = await booqableService.fetchProductById(productId);
          }

          return {
            ...order,
            customer_name: customer.name,
            customer_email: customer.email,
            equipment_name: productDetails?.name || 'Unknown Equipment',
            price_in_dollars: order.price_in_cents / 100,
            formatted_start_date: formatDateOnly(order.starts_at),
            formatted_end_date: formatDateOnly(order.stops_at)
          };
        } catch (error) {
          console.error(`Error fetching details for order ${order.id}:`, error);
          return order;
        }
      }));

      setRentals(ordersWithDetails);
    } catch (error) {
      console.error('Error loading rentals:', error);
      setError('Failed to load rentals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRentals();
  }, []);

  const handleEditSuccess = () => {
    loadRentals();
    setIsEditModalOpen(false);
  };

  const handleDeleteSuccess = () => {
    loadRentals();
    setIsDeleteModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order #
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Equipment
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Start Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              End Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rentals.map((rental) => (
            <tr key={rental.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                #{rental.number}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {rental.customer_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {rental.equipment_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {rental.formatted_start_date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {rental.formatted_end_date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${rental.status === 'started' ? 'bg-green-100 text-green-800' : 
                    rental.status === 'stopped' ? 'bg-gray-100 text-gray-800' :
                    rental.status === 'canceled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'}`}>
                  {rental.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${rental.price_in_dollars.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => {
                    setSelectedRental(rental);
                    setIsEditModalOpen(true);
                  }}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setSelectedRental(rental);
                    setIsDeleteModalOpen(true);
                  }}
                  className="text-red-600 hover:text-red-900"
                >
                  Cancel
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedRental && (
        <>
          <EditRentalModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            rental={selectedRental}
            onSuccess={handleEditSuccess}
          />
          <DeleteRentalModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            rental={selectedRental}
            onSuccess={handleDeleteSuccess}
          />
        </>
      )}
    </div>
  );
} 