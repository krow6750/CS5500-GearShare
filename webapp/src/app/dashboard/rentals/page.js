'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { firebaseDB } from '@/lib/firebase/db';
import { COLLECTIONS, STATUS } from '@/lib/firebase/models';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AddRentalModal from '@/components/rentals/AddRentalModal';
import { formatDate } from '@/lib/utils/dateFormat';
import { useSidebar } from '../../../contexts/SidebarContext';
import { syncRentals } from '@/app/actions/syncActions';

const ITEMS_PER_PAGE = 15;

export default function RentalsPage() {
  const { isExpanded } = useSidebar();
  const [isMounted, setIsMounted] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const queryClient = useQueryClient();

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const { data: rentals, isLoading } = useQuery({
    queryKey: ['rentals'],
    queryFn: async () => {
      const rentalsData = await firebaseDB.query(COLLECTIONS.RENTALS);
      
      const equipment = await firebaseDB.query(COLLECTIONS.EQUIPMENT);
      const equipmentMap = equipment.reduce((acc, eq) => {
        acc[eq.equipment_id] = eq;
        return acc;
      }, {});

      return rentalsData.map(rental => ({
        ...rental,
        equipment_details: equipmentMap[rental.equipment_id] || {}
      }));
    }
  });

  const statusColors = {
    [STATUS.RENTAL.ACTIVE]: 'bg-emerald-100 text-emerald-800',
    [STATUS.RENTAL.COMPLETED]: 'bg-slate-100 text-slate-800',
    [STATUS.RENTAL.OVERDUE]: 'bg-red-100 text-red-800',
    [STATUS.RENTAL.CANCELLED]: 'bg-amber-100 text-amber-800'
  };

  const totalPages = Math.ceil((rentals?.length || 0) / ITEMS_PER_PAGE);
  const paginatedRentals = rentals?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (!isMounted) return null;
  if (isLoading) return <LoadingSpinner />;

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
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors"
            >
              Add New Rental
            </button>
          </div>
        </div>
      </div>

      {/* Table Section - Updated for better responsiveness */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600">
                  Equipment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600">
                  Start
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600">
                  End
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedRentals?.map((rental) => (
                <tr 
                  key={rental.id} 
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {rental.rental_id}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {rental.user_id}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {rental.equipment_id}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[rental.status]}`}>
                      {rental.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {isMounted ? formatDate(rental.start_date) : ''}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {isMounted ? formatDate(rental.end_date) : ''}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    ${rental.total_cost ? rental.total_cost.toFixed(2) : '0.00'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination - Updated for better responsiveness */}
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

      {/* Modals stay the same */}
      <AddRentalModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries(['rentals']);
          setIsAddModalOpen(false);
        }}
      />
    </div>
  );
}