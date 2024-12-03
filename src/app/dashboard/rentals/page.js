'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import booqableService from '@/lib/booqable/booqableService';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/utils/dateFormat';
import { useSidebar } from '../../../contexts/SidebarContext';

const ITEMS_PER_PAGE = 15;

export default function RentalsPage() {
  const { isExpanded } = useSidebar();
  const [isMounted, setIsMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [customerFilter, setCustomerFilter] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

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

  const statusColors = {
    'RETURNED': 'bg-green-100 text-green-800',
    'RESERVED': 'bg-yellow-100 text-yellow-800',
    'PICKED_UP': 'bg-blue-100 text-blue-800',
    'DEFAULT': 'bg-slate-100 text-slate-800'
  };

  const searchFields = [
    { value: 'all', label: 'All Fields' },
    { value: 'number', label: 'Order #' },
    { value: 'customer', label: 'Customer' },
    { value: 'status', label: 'Status' },
    { value: 'start_date', label: 'Start Date' },
    { value: 'end_date', label: 'End Date' },
    { value: 'price', label: 'Price' }
  ];

  const filteredRentals = rentals?.filter(rental => {
    const customer = customers?.find(c => c.id === rental.customer_id);
    
    if (!searchValue) return true;

    const searchLower = searchValue.toLowerCase();
    
    switch (searchField) {
      case 'number':
        return String(rental.number || '').toLowerCase().includes(searchLower);
      case 'customer':
        return (
          customer?.name?.toLowerCase().includes(searchLower) ||
          customer?.email?.toLowerCase().includes(searchLower)
        );
      case 'status':
        return String(rental.status || '').toLowerCase().includes(searchLower);
      case 'start_date':
        return String(formatDate(rental.starts_at) || '').toLowerCase().includes(searchLower);
      case 'end_date':
        return String(formatDate(rental.stops_at) || '').toLowerCase().includes(searchLower);
      case 'price':
        const price = ((rental.price_in_cents || 0) / 100).toFixed(2);
        return price.includes(searchValue);
      case 'all':
        return [
          rental.number,
          customer?.name,
          customer?.email,
          rental.status,
          formatDate(rental.starts_at),
          formatDate(rental.stops_at),
          ((rental.price_in_cents || 0) / 100).toFixed(2)
        ].some(field => 
          String(field || '').toLowerCase().includes(searchLower)
        );
      default:
        return true;
    }
  });

  const totalPages = Math.ceil((filteredRentals?.length || 0) / ITEMS_PER_PAGE);
  const paginatedRentals = filteredRentals?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (!isMounted) return null;
  if (rentalsLoading || customersLoading) return <LoadingSpinner />;

  return (
    <div className={`
      transition-all duration-300
      ${isExpanded ? 'ml-64' : 'ml-20'}
      pr-8 pl-8
    `}>
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Rentals</h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage and track all equipment rentals
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-700 whitespace-nowrap">Search by:</span>
              <select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                className="px-3 py-2 border rounded-md text-slate-900 bg-white"
              >
                {searchFields.map(field => (
                  <option key={field.value} value={field.value}>
                    {field.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder={`Search ${searchField === 'all' ? 'all fields' : searchFields.find(f => f.value === searchField)?.label.toLowerCase()}...`}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="px-4 py-2 border rounded-md w-64 text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600">Customer</th>
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
    </div>
  );
}