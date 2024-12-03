'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AddRepairModal from '@/components/repairs/AddRepairModal';
import EditRepairModal from '@/components/repairs/EditRepairModal';
import { formatDate } from '@/lib/utils/dateFormat';
import { useSidebar } from '../../../contexts/SidebarContext';
import { airtableService } from '@/lib/airtable/airtableService';
import { formatCurrency } from '@/lib/utils/currencyFormatter';
import { STATUS } from '@/lib/airtable/models';
import { emailTemplateService } from '@/lib/airtable/emailTemplateServices';

const ITEMS_PER_PAGE = 10;

const formatToMMDDYYYY = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${month}-${day}-${year}`;
};

const formatZapierDateTime = (dateTimeString) => {
  if (!dateTimeString) return '';
  
  const date = new Date(dateTimeString);
  
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  
  return `${month}-${day}-${year} ${hours}:${minutes} ${ampm}`;
};

export default function RepairsPage() {
  const { isExpanded } = useSidebar();
  const [isMounted, setIsMounted] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [searchField, setSearchField] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [selectedCreateTemplate, setSelectedCreateTemplate] = useState('');
  const [selectedCompletedTemplate, setSelectedCompletedTemplate] = useState('');

  const queryClient = useQueryClient();

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const { data: repairs, isLoading } = useQuery({
    queryKey: ['repairs'],
    queryFn: async () => {
      try {
        const items = await airtableService.fetchAllRepairTickets();

        const sortedItems = items.sort((a, b) => {
          const aAutonum = parseInt(a.fields['Autonumber']) || 0;
          const bAutonum = parseInt(b.fields['Autonumber']) || 0;
          return aAutonum - bAutonum;
        });

        console.log('=== FULL REPAIR TICKETS API RESPONSE ===', {
          totalRecords: sortedItems?.length,
          fullResponse: sortedItems,
          firstRecord: sortedItems?.[0],
          firstRecordFields: sortedItems?.[0]?.fields,
          allFieldNames: sortedItems?.[0] ? Object.keys(sortedItems[0].fields).sort() : []
        });

        return sortedItems;
      } catch (error) {
        console.error('Failed to fetch repair tickets:', error);
        throw error;
      }
    }
  });

  const { data: templates } = useQuery({
    queryKey: ['emailTemplates'],
    queryFn: async () => {
      try {
        const templates = await emailTemplateService.fetchEmailTemplates();
        return templates;
      } catch (error) {
        console.error('Failed to fetch email templates:', error);
        throw error;
      }
    }
  });

  console.log('=== REPAIR FIELDS ===', repairs?.[0]?.fields);

  const handleAddSuccess = async (newRepair) => {
    await queryClient.invalidateQueries(['repairs']);
    setIsAddModalOpen(false);
  };

  const handleEditSuccess = async (updatedRepair) => {
    await queryClient.invalidateQueries(['repairs']);
    setIsEditModalOpen(false);
    setSelectedRepair(null);
  };

  if (!isMounted) return null;
  if (isLoading) return <LoadingSpinner />;

  const filteredRepairs = repairs?.filter(repair => {
    if (!searchValue) return true;

    const searchLower = searchValue.toLowerCase();
    
    if (searchField === 'itemType') {
      console.log('Searching type:', {
        itemType: repair.fields['Item Type'],
        typeOfItem: repair.fields['Type of Item'],
        searchValue: searchLower
      });
    }
    
    switch (searchField) {
      case 'repairId':
        return String(repair.fields['Repair ID'] || '').toLowerCase().includes(searchLower);
      case 'name':
        return (
          String(repair.fields['First Name'] || '').toLowerCase().includes(searchLower) ||
          String(repair.fields['Last Name'] || '').toLowerCase().includes(searchLower)
        );
      case 'email':
        return String(repair.fields['Email'] || '').toLowerCase().includes(searchLower);
      case 'status':
        return String(repair.fields['Status'] || '').toLowerCase().includes(searchLower);
      case 'itemType':
        const matchesItemType = String(repair.fields['Item Type'] || '').toLowerCase().includes(searchLower);
        const matchesTypeOfItem = String(repair.fields['Type of Item'] || '').toLowerCase().includes(searchLower);
        console.log('Type matches:', { matchesItemType, matchesTypeOfItem });
        return matchesItemType || matchesTypeOfItem;
      case 'brand':
        return String(repair.fields['Brand'] || '').toLowerCase().includes(searchLower);
      case 'damage':
        return String(repair.fields['Damage or Defect'] || '').toLowerCase().includes(searchLower);
      case 'payment':
        return String(repair.fields['Payment type'] || '').toLowerCase().includes(searchLower);
      case 'referral':
        return String(repair.fields['Referred By'] || '').toLowerCase().includes(searchLower);
      case 'all':
        return [
          repair.fields['Repair ID'],
          repair.fields['First Name'],
          repair.fields['Last Name'],
          repair.fields['Email'],
          repair.fields['Status'],
          repair.fields['Item Type'],
          repair.fields['Type of Item'],
          repair.fields['Brand'],
          repair.fields['Damage or Defect'],
          repair.fields['Payment type'],
          repair.fields['Referred By']
        ].some(field => 
          String(field || '').toLowerCase().includes(searchLower)
        );
      default:
        return true;
    }
  });

  const totalPages = Math.ceil((filteredRepairs?.length || 0) / ITEMS_PER_PAGE);
  const paginatedRepairs = filteredRepairs?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const createRepairTemplates = templates?.filter(
    template => template.templateType === "Create Repair Email Template"
  ).sort((a, b) => a.templateName.localeCompare(b.templateName));

  const completedRepairTemplates = templates?.filter(
    template => template.templateType === "Completed Repair Email Template"
  ).sort((a, b) => a.templateName.localeCompare(b.templateName));

  const searchFields = [
    { value: 'all', label: 'All Fields' },
    { value: 'repairId', label: 'Repair ID' },
    { value: 'name', label: 'Name' },
    { value: 'email', label: 'Email' },
    { value: 'status', label: 'Status' },
    { value: 'itemType', label: 'Item Type' },
    { value: 'brand', label: 'Brand' },
    { value: 'damage', label: 'Damage' },
    { value: 'payment', label: 'Payment Type' },
    { value: 'referral', label: 'Referred By' }
  ];

  if (!isMounted) return null;
  if (isLoading) return <LoadingSpinner />;
  return (
    <div className="container mx-auto max-w-[1400px]">
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 whitespace-nowrap">Repair Tickets</h1>
              <p className="text-sm text-slate-600 mt-1 whitespace-nowrap">
                Manage equipment repair tickets
              </p>
            </div>
            <div className="mb-4">
              <label htmlFor="createTemplate" className="block text-sm font-medium text-gray-700">
                Repair Creation Notification
              </label>
              <select
                id="createTemplate"
                value={selectedCreateTemplate}
                onChange={(e) => setSelectedCreateTemplate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-black"
              >
                <option value="" className="text-black">Select a template</option>
                {createRepairTemplates?.map((template) => (
                  <option key={template.id} value={template.templateName} className="text-black">
                    {template.templateName}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="completedTemplate" className="block text-sm font-medium text-gray-700">
                Repair Completion Notification
              </label>
              <select
                id="completedTemplate"
                value={selectedCompletedTemplate}
                onChange={(e) => setSelectedCompletedTemplate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-black"
              >
                <option value="" className="text-black">Select a template</option>
                {completedRepairTemplates?.map((template) => (
                  <option key={template.id} value={template.templateName} className="text-black">
                    {template.templateName}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              Create Repair Ticket
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-700 whitespace-nowrap">Search by:</span>
              <select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                className="border border-slate-200 rounded-md px-3 py-2 text-slate-900 w-[150px]"
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
                className="border border-slate-200 rounded-md px-3 py-2 text-slate-900 w-[220px] placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider w-[90px]">Actions</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider w-[180px]">Repair ID</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider w-[120px]">First Name</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider w-[120px]">Last Name</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider w-[200px]">Email</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider w-[200px]">Status</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider w-[130px]">Item Type</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider w-[130px]">Brand</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider w-[130px]">Price Quote</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider w-[130px]">Final Price</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider w-[130px]">Type of Item</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider w-[180px]">Damage or Defect</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider w-[130px]">Payment type</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider w-[130px]">Telephone</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider w-[120px]">Weight (Ounces)</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider w-[120px]">Color</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider w-[150px]">Photo/Attachment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider w-[130px]">Referred By</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider w-[150px]">Requestor Type</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider w-[130px]">Submitted On</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider w-[180px] break-words">Delivery of Item</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider w-[180px]">(For Zapier)</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider w-[130px]">Amount Paid</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRepairs?.map((repair) => (
                <tr key={repair.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-3 py-3 whitespace-nowrap">
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
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-900 whitespace-normal">
                    {repair.fields['Repair ID']}
                  </td>
                  <td className="px-2 py-3 text-sm text-slate-900 truncate">
                    {repair.fields['First Name']}
                  </td>
                  <td className="px-2 py-3 text-sm text-slate-900 truncate">
                    {repair.fields['Last Name']}
                  </td>
                  <td className="px-2 py-3 text-sm text-slate-900 whitespace-normal">
                    {repair.fields['Email']}
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-900 whitespace-normal">
                    {repair.fields['Status']}
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-900 truncate">
                    {repair.fields['Item Type']}
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-900 truncate">
                    {repair.fields['Brand']}
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-900 truncate">
                    {formatCurrency(repair.fields['Price Quote'])}
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-900 truncate">
                    {formatCurrency(repair.fields['Final Price'])}
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-900 truncate">
                    {repair.fields['Type of Item']}
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-900 truncate">
                    {repair.fields['Damage or Defect']}
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-900 truncate">
                    {repair.fields['Payment type']}
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-900 truncate">
                    {repair.fields['Telephone']}
                  </td>
                  <td className="px-2 py-3 text-sm text-slate-900 truncate">
                    {repair.fields['Weight (Ounces)']}
                  </td>
                  <td className="px-2 py-3 text-sm text-slate-900 truncate">
                    {repair.fields['Color']}
                  </td>
                  <td className="px-2 py-3 text-sm text-slate-900 truncate">
                    {Array.isArray(repair.fields['Photo/Attachment']) && repair.fields['Photo/Attachment'].length > 0 ? (
                      <div className="flex gap-2">
                        {repair.fields['Photo/Attachment'].map((photo, index) => (
                          <a 
                            key={photo.id}
                            href={photo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <img 
                              src={photo.thumbnails?.small?.url} 
                              alt={`Attachment ${index + 1}`}
                              className="w-8 h-8 object-cover rounded"
                            />
                          </a>
                        ))}
                      </div>
                    ) : 'No photos'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900 truncate">
                    {repair.fields['Referred By']}
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-900 truncate">
                    {repair.fields['Requestor Type']}
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-900 truncate">
                    {formatToMMDDYYYY(repair.fields['Submitted On'])}
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-900 whitespace-normal">
                    {repair.fields['Delivery of Item']}
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-900">
                    {repair.fields['(For Zapier)'] ? (
                      <div className="flex flex-col">
                        <span>{formatZapierDateTime(repair.fields['(For Zapier)']).split(' ').slice(0, 1)}</span>
                        <span className="text-slate-600">{formatZapierDateTime(repair.fields['(For Zapier)']).split(' ').slice(1).join(' ')}</span>
                      </div>
                    ) : ''}
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-900 truncate">
                    {formatCurrency(repair.fields['Amount Paid'])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-600">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredRepairs?.length || 0)} of {filteredRepairs?.length || 0}
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

      <AddRepairModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
        defaultTemplate={selectedCreateTemplate}
        completedTemplate={selectedCompletedTemplate}
      />

      <EditRepairModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        repair={selectedRepair}
        onSuccess={handleEditSuccess}
        defaultTemplate={selectedCreateTemplate}
        completedTemplate={selectedCompletedTemplate}
      />
    </div>
  );
}