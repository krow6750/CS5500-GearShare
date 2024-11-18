'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { firebaseDB } from '@/lib/firebase/db';
import { COLLECTIONS, STATUS } from '@/lib/firebase/models';
import AddEquipmentModal from '@/components/equipment/AddEquipmentModal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useSidebar } from '../../../contexts/SidebarContext';

const ITEMS_PER_PAGE = 15;

export default function EquipmentPage() {
  const { isExpanded } = useSidebar();
  const [isMounted, setIsMounted] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const queryClient = useQueryClient();

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []); 

  const { data: equipment, isLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const items = await firebaseDB.query(COLLECTIONS.EQUIPMENT);
      return items;
    }
  });

  if (!isMounted) return null;
  if (isLoading) return <LoadingSpinner />;

  const handleAddSuccess = () => {
    queryClient.invalidateQueries(['equipment']);
  };

  const statusColors = {
    [STATUS.EQUIPMENT.AVAILABLE]: 'bg-emerald-100 text-emerald-800',
    [STATUS.EQUIPMENT.RENTED]: 'bg-slate-100 text-slate-800',
    [STATUS.EQUIPMENT.IN_REPAIR]: 'bg-red-100 text-red-800'
  };

  const totalPages = Math.ceil((equipment?.length || 0) / ITEMS_PER_PAGE);
  const paginatedEquipment = equipment?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className={`
      transition-all duration-300
      ${isExpanded ? 'ml-64' : 'ml-20'}
      pr-8 pl-8
    `}>
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Equipment</h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage your equipment inventory
            </p>
          </div>
          
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors"
          >
            Add Equipment
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedEquipment?.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {item.equipment_id || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {item.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {item.equipment_category || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      statusColors[item.status] || 'bg-slate-100 text-slate-800'
                    }`}>
                      {(item.status || 'UNKNOWN').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    ${item.price ? Number(item.price).toFixed(2) : '0.00'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
        <div className="text-sm text-slate-600 mb-4 sm:mb-0">
          Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, equipment?.length || 0)} of {equipment?.length || 0}
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

      <AddEquipmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
}
