'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { activityService } from '@/lib/activity/activityService';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ClientOnly from '@/components/ui/ClientOnly';
import { useSidebar } from '../../../contexts/SidebarContext';

const ITEMS_PER_PAGE = 15;

export default function ActivityPage() {
  const { isExpanded } = useSidebar();
  const [isMounted, setIsMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    action_type: '',
    dateRange: 'all',
    user_id: '',
    collection: ''
  });

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities', filters],
    queryFn: () => activityService.getActivities(filters)
  });

  const actionTypes = [
    'create',
    'update',
    'delete',
    'sync',
    'payment',
    'email'
  ];

  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];

  const actionColors = {
    'create': 'bg-emerald-100 text-emerald-800',
    'update': 'bg-slate-100 text-slate-800',
    'delete': 'bg-red-100 text-red-800',
    'sync': 'bg-amber-100 text-amber-800',
    'payment': 'bg-blue-100 text-blue-800',
    'email': 'bg-purple-100 text-purple-800'
  };

  const collections = [
    'repairs',
    'rentals',
    'equipment',
    'users',
    'payments',
    'inventory'
  ];

  const filteredActivities = activities?.filter(activity => {
    const searchLower = searchTerm.toLowerCase();
    return (
      activity.description.toLowerCase().includes(searchLower) ||
      activity.user_id.toString().includes(searchLower) ||
      activity.action_type.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil((filteredActivities?.length || 0) / ITEMS_PER_PAGE);
  const paginatedActivities = filteredActivities?.slice(
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
        <h1 className="text-2xl font-bold text-slate-900">Activity Log</h1>
        <p className="text-sm text-slate-600 mt-1">
          Track all system activities and changes
        </p>
      </div>

      <ClientOnly>
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border-slate-300 focus:border-slate-500 focus:ring-slate-500"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Action Type
              </label>
              <select
                className="w-full rounded-md border-slate-300 focus:border-slate-500 focus:ring-slate-500 text-slate-900"
                value={filters.action_type}
                onChange={(e) => setFilters(f => ({ ...f, action_type: e.target.value }))}
              >
                <option value="" className="text-slate-900">All Actions</option>
                {actionTypes.map(type => (
                  <option key={type} value={type} className="text-slate-900">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date Range
              </label>
              <select
                className="w-full rounded-md border-slate-300 focus:border-slate-500 focus:ring-slate-500 text-slate-900 font-medium"
                value={filters.dateRange}
                onChange={(e) => setFilters(f => ({ ...f, dateRange: e.target.value }))}
              >
                {dateRanges.map(range => (
                  <option key={range.value} value={range.value} className="text-slate-900 font-medium">
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Collection
              </label>
              <select
                className="w-full rounded-md border-slate-300 focus:border-slate-500 focus:ring-slate-500 text-slate-900 font-medium"
                value={filters.collection}
                onChange={(e) => setFilters(f => ({ ...f, collection: e.target.value }))}
              >
                <option value="" className="text-slate-900 font-medium">All Collections</option>
                {collections.map(col => (
                  <option key={col} value={col} className="text-slate-900 font-medium">
                    {col.charAt(0).toUpperCase() + col.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Clear Filters
              </label>
              <button
                onClick={() => {
                  setFilters({
                    action_type: '',
                    dateRange: 'all',
                    user_id: '',
                    collection: ''
                  });
                  setSearchTerm('');
                }}
                className="w-full px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {paginatedActivities?.map((activity) => (
                  <tr key={activity.log_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {isMounted ? new Date(activity.activity_time).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {activity.user_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 inline-flex text-sm font-semibold rounded-full
                        ${actionColors[activity.action_type] || 'bg-slate-100 text-slate-800'}
                      `}>
                        {activity.action_type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">
                      {activity.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
          <div className="text-sm text-slate-600 mb-4 sm:mb-0">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredActivities?.length || 0)} of {filteredActivities?.length || 0}
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
      </ClientOnly>
    </div>
  );
}