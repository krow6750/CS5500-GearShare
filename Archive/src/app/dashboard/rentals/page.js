'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import booqableService from '@/lib/booqable/booqableService';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AddRentalModal from '@/components/rentals/AddRentalModal';
import { formatDate } from '@/lib/utils/dateFormat';
import { useSidebar } from '../../../contexts/SidebarContext';

const ITEMS_PER_PAGE = 15;

export default function RentalsPage() {
  const { isExpanded } = useSidebar();
  const [isMounted, setIsMounted] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerFilter, setCustomerFilter] = useState('');

  const queryClient = useQueryClient();

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Fetch both rentals and customers
  const { data: rentals, isLoading: rentalsLoading } = useQuery({
    queryKey: ['rentals'],
    queryFn: async () => {
      const data = await booqableService.fetchAllOrders();
      console.log('Fetched rentals:', data);
      return data;
    }
  });

  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => booqableService.fetchAllCustomers()
  });

  // Update the status color mapping
  const statusColors = {
    'RETURNED': 'bg-green-100 text-green-800',
    'RESERVED': 'bg-yellow-100 text-yellow-800',
    'PICKED_UP': 'bg-blue-100 text-blue-800',
    // Default status color
    'DEFAULT': 'bg-slate-100 text-slate-800'
  };

  // Filter rentals based on selected customer
  const filteredRentals = rentals?.filter(rental => {
    if (!selectedCustomer) return true;
    return rental.customer_id === selectedCustomer.id;
  });

  const totalPages = Math.ceil((filteredRentals?.length || 0) / ITEMS_PER_PAGE);
  const paginatedRentals = filteredRentals?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Filter customers based on search input
  const filteredCustomers = customers?.filter(customer => 
    customer.name.toLowerCase().includes(customerFilter.toLowerCase()) ||
    customer.email.toLowerCase().includes(customerFilter.toLowerCase())
  );

  if (!isMounted) return null;
  if (rentalsLoading || customersLoading) return <LoadingSpinner />;

  return (
    <div className={`
      transition-all duration-300
      ${isExpanded ? 'ml-64' : 'ml-20'}
      pr-8 pl-8
    `}>
      {/* Header Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Rentals</h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage and track all equipment rentals
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            {/* Customer Filter */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search customers..."
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                className="px-4 py-2 border rounded-md w-64"
              />
              {customerFilter && filteredCustomers && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredCustomers.map(customer => (
                    <div
                      key={customer.id}
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setCustomerFilter('');
                      }}
                      className="px-4 py-2 hover:bg-slate-50 cursor-pointer"
                    >
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-slate-500">{customer.email}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedCustomer && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-md">
                <span>{selectedCustomer.name}</span>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  ×
                </button>
              </div>
            )}

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors"
            >
              Add New Rental
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600">Equipment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600">Start</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600">End</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedRentals?.map((rental) => {
                const customer = customers?.find(c => c.id === rental.customer_id);
                return (
                  <tr key={rental.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {rental.number ? `#${rental.number}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {customer?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {rental.lines?.length > 0 
                        ? rental.lines.map(line => line.group_name || line.product_name).join(', ')
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`
                        inline-flex px-2 py-1 text-xs font-medium rounded-full
                        ${statusColors[rental.status?.toUpperCase()] || statusColors.DEFAULT}
                      `}>
                        {rental.status ? rental.status.replace('_', ' ') : 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {formatDate(rental.starts_at) || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {formatDate(rental.stops_at) || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      ${`${((rental.price_in_cents || 0) / 100).toFixed(2)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Section */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
        <div className="text-sm text-slate-600 mb-4 sm:mb-0">
          Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, rentals?.length || 0)} of {rentals?.length || 0}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-50"
          >
            Previous
          </button>
          
          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 text-sm rounded-md ${
                  currentPage === i + 1
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <AddRentalModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries(['rentals']);
          setIsAddModalOpen(false);
        }}
        customers={customers}
      />
    </div>
  );
}