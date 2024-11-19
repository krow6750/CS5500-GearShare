'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { firebaseDB } from '@/lib/firebase/db';
import { COLLECTIONS, STATUS } from '@/lib/firebase/models';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AddRepairModal from '@/components/repairs/AddRepairModal';
import EditRepairModal from '@/components/repairs/EditRepairModal';
import DeleteRepairModal from '@/components/repairs/DeleteRepairModal';
import { formatDate } from '@/lib/utils/dateFormat';
import { useSidebar } from '../../../contexts/SidebarContext';
import { airtableService } from '@/lib/airtable/airtableService';

const ITEMS_PER_PAGE = 15;

export default function RepairsPage() {
  const { isExpanded } = useSidebar();
  const [isMounted, setIsMounted] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const queryClient = useQueryClient();

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const { data: repairs, isLoading } = useQuery({
    queryKey: ['repairs'],
    queryFn: async () => {
      const items = await firebaseDB.query(COLLECTIONS.REPAIRS);
      return items;
    }
  });

  const statusColors = {
    [STATUS.REPAIR.PENDING]: 'bg-amber-100 text-amber-800',
    [STATUS.REPAIR.IN_PROGRESS]: 'bg-slate-100 text-slate-800',
    [STATUS.REPAIR.COMPLETED]: 'bg-emerald-100 text-emerald-800'
  };

  const totalPages = Math.ceil((repairs?.length || 0) / ITEMS_PER_PAGE);
  const paginatedRepairs = repairs?.slice(
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
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Repair Tickets</h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage equipment repair tickets
            </p>
          </div>
          
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors"
          >
            Create Repair Ticket
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Ticket ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Equipment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Reported By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Est. Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedRepairs?.map((repair) => (
                <tr key={repair.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {repair.repair_ticket_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {repair.equipment_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[repair.status]}`}>
                      {repair.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {repair.reported_by}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {isMounted ? formatDate(repair.start_date) : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {repair.estimate_repair_time} hours
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => {
                          setSelectedRepair(repair);
                          setIsEditModalOpen(true);
                        }}
                        className="text-sm text-slate-600 hover:text-slate-900"
                      >
                        Edit
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={() => {
                          setSelectedRepair(repair);
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-sm text-slate-600 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
        <div className="text-sm text-slate-600 mb-4 sm:mb-0">
          Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, repairs?.length || 0)} of {repairs?.length || 0}
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

      <AddRepairModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries(['repairs']);
          setIsAddModalOpen(false);
        }}
      />

      <EditRepairModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        repair={selectedRepair}
        onSuccess={() => {
          queryClient.invalidateQueries(['repairs']);
          setIsEditModalOpen(false);
        }}
      />

      <DeleteRepairModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedRepair(null);
        }}
        repair={selectedRepair}
        onSuccess={() => {
          queryClient.invalidateQueries(['repairs']);
          setIsDeleteModalOpen(false);
          setSelectedRepair(null);
        }}
      />
    </div>
  );
}