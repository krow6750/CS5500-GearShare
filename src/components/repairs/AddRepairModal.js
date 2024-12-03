'use client';
import { activityService } from '@/lib/activity/activityService';
import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { generateId } from '@/lib/utils/dateFormat';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { repairService } from '@/lib/services/repairService';
import { airtableService } from '@/lib/airtable/airtableService';
import { STATUS } from '@/lib/airtable/models';
import { emailServices } from '@/lib/email/emailService';
import { useQuery } from '@tanstack/react-query';
import { emailTemplateService } from '@/lib/airtable/emailTemplateServices';

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

const PAYMENT_TYPES = ['cash', 'check', 'Square', 'Venmo', 'combo'];

const DELIVERY_OPTIONS = [
  'I\'ll drop it off at Maine GearShare (BRUNSWICK)',
  'I\'ll mail it',
  'Repair Event',
  'I\'ll drop it off at Toad & Co. (PORTLAND)'
];

const REQUESTOR_TYPES = [
  'Board/Staff',
  'Paying Customer',
  'MGS/Internal',
  'Maloja Warranty',
  'Free, repair event',
  'Stio Warranty'
];

const ITEM_TYPES = [
  'Jacket',
  'Tent',
  'Sleeping Bag',
  'Backpack',
  'Hammock',
  'Luggage',
  'Other'
];

const INITIAL_STATUSES = [
  'Awaiting Drop-Off',
  'Can\'t Repair',
  'Contacted, Awaiting Customer Response',
  'Dropped Off, Awaiting Repair',
  'In Repair'
];

export default function AddRepairModal({ isOpen, onClose, onSuccess, defaultTemplate, completedTemplate }) {
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState({
    'First Name': '',
    'Last Name': '',
    'Internal Notes': '',
    'Item Type': '',
    'Price Quote': 0,
    'Final Price': 0,
    'Type of Item': '',
    'Damage or Defect': '',
    'Payment type': '',
    'Brand': '',
    'Color': '',
    'Created': new Date().toISOString().split('T')[0],
    'Date Quoted': new Date().toISOString().split('T')[0],
    'Delivery of Item': '',
    'Email': '',
    'Photo/Attachment': [],
    'Referred By': '',
    'Requestor Type': '',
    'Status': STATUS.STATUS['Dropped Off, Awaiting Repair'],
    'Submitted On': new Date().toISOString().split('T')[0],
    'Telephone': '',
    'Weight (Ounces)': 0,
    'Amount Paid': 0,
    'Repair ID': '',
    '(For Zapier)': ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCreateTemplate, setSelectedCreateTemplate] = useState(defaultTemplate);
  
  const { data: templates } = useQuery({
    queryKey: ['emailTemplates'],
    queryFn: async () => {
      try {
        const templates = await emailTemplateService.fetchEmailTemplates();
        return templates.sort((a, b) => a.templateName.localeCompare(b.templateName));
      } catch (error) {
        console.error('Failed to fetch email templates:', error);
        throw error;
      }
    }
  });

  const createRepairTemplates = templates?.filter(
    template => template.templateType === "Create Repair Email Template"
  ).sort((a, b) => a.templateName.localeCompare(b.templateName));

  const completedRepairTemplates = templates?.filter(
    template => template.templateType === "Completed Repair Email Template"
  ).sort((a, b) => a.templateName.localeCompare(b.templateName));

  useEffect(() => {
    setIsMounted(true);
    if (isMounted) {
      const timestamp = new Date().getTime();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const repairId = `REP${timestamp}${random}`;
      
      setFormData(prev => ({
        ...prev,
        'Repair ID': repairId
      }));
    }
  }, [isMounted]);

  useEffect(() => {
    setSelectedCreateTemplate(defaultTemplate);
  }, [defaultTemplate, completedTemplate]);

  if (!isMounted) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const data = {
        ...formData,
        'Completed Repair Template': completedTemplate,
        'Sent Email': false
      };

      const existingRepair = await airtableService.findRepairByTicketId(data['Repair ID']);
      if (existingRepair) {
        throw new Error(`A repair ticket with ID ${data['Repair ID']} already exists`);
      }

      let processedFormData = { ...data };
      if (data['Photo/Attachment']?.length > 0) {
        processedFormData['Photo/Attachment'] = data['Photo/Attachment'];
      } else {
        processedFormData['Photo/Attachment'] = [];
      }

      console.log('Email sending conditions:', {
        hasTemplate: !!selectedCreateTemplate,
        hasEmail: !!data['Email'],
        statusMatch: INITIAL_STATUSES.includes(data['Status']),
        status: data['Status']
      });

      if (selectedCreateTemplate && 
          data['Email'] && 
          INITIAL_STATUSES.includes(data['Status'])) {
        console.log('Attempting to send email with template:', selectedCreateTemplate);
        try {
          await emailServices.sendEmail({
            templateName: selectedCreateTemplate,
            recipients: data['Email'],
            firstName: data['First Name'] || '',
            lastName: data['Last Name'] || '',
            finalPrice: data['Final Price'] || 0,
            repairId: data['Repair ID'] || '',
            itemType: data['Item Type'] || '',
            paymentType: data['Payment type'] || '',
            status: data['Status'] || '',
            notes: data['Internal Notes'] || ''
          });
          data['Sent Email'] = true;
          console.log('Email sent successfully');
        } catch (emailError) {
          console.error('Failed to send email:', emailError);
        }
      } else {
        console.log('Skipping email send - conditions not met');
      }

      let airtableRecord = await airtableService.createRepairTicket(processedFormData);
      console.log('Airtable record created:', airtableRecord);

      await activityService.logRepairActivity('create', {
        fields: processedFormData,
        customer: {
          name: `${processedFormData['First Name']} ${processedFormData['Last Name']}`.trim()
        },
        itemType: processedFormData['Item Type'],
        status: processedFormData['Status']
      });

      setFormData({
        'First Name': '',
        'Last Name': '',
        'Internal Notes': '',
        'Item Type': '',
        'Price Quote': 0,
        'Final Price': 0,
        'Type of Item': '',
        'Damage or Defect': '',
        'Payment type': '',
        'Brand': '',
        'Color': '',
        'Created': new Date().toISOString().split('T')[0],
        'Date Quoted': new Date().toISOString().split('T')[0],
        'Delivery of Item': '',
        'Email': '',
        'Photo/Attachment': [],
        'Referred By': '',
        'Requestor Type': '',
        'Status': STATUS.STATUS['Dropped Off, Awaiting Repair'],
        'Submitted On': new Date().toISOString().split('T')[0],
        'Telephone': '',
        'Weight (Ounces)': 0,
        'Amount Paid': 0,
        'Repair ID': generateId(),
        '(For Zapier)': ''
      });

      if (onSuccess) {
        onSuccess(airtableRecord);
      }
      onClose();
    } catch (error) {
      console.error('Repair creation failed:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-slate-900/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-3xl w-full rounded-lg bg-white shadow-lg">
          <div className="p-6 flex flex-col h-[90vh]">
            <Dialog.Title className="text-xl font-semibold text-slate-900 mb-2 flex-shrink-0">
              Create Repair Ticket
            </Dialog.Title>

            <div className="mb-6">
              <label className={labelStyles}>Create Repair Notification Email</label>
              <select
                className={inputStyles}
                value={selectedCreateTemplate}
                onChange={(e) => setSelectedCreateTemplate(e.target.value)}
              >
                <option value="">Select Template...</option>
                {createRepairTemplates?.map(template => (
                  <option key={template.id} value={template.templateName}>
                    {template.templateName}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                <div className="flex-1 overflow-y-auto px-2">
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                      {error}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div>
                        <label className={labelStyles}>Repair ID</label>
                        <input
                          type="text"
                          className={inputStyles}
                          value={formData['Repair ID']}
                          readOnly
                        />
                      </div>

                      <div>
                        <label className={labelStyles}>First Name</label>
                        <input
                          type="text"
                          required
                          className={inputStyles}
                          value={formData['First Name']}
                          onChange={(e) => setFormData({...formData, 'First Name': e.target.value})}
                        />
                      </div>

                      <div>
                        <label className={labelStyles}>Last Name</label>
                        <input
                          type="text"
                          required
                          className={inputStyles}
                          value={formData['Last Name']}
                          onChange={(e) => setFormData({...formData, 'Last Name': e.target.value})}
                        />
                      </div>

                      <div>
                        <label className={labelStyles}>Email</label>
                        <input
                          type="email"
                          className={inputStyles}
                          value={formData['Email']}
                          onChange={(e) => setFormData({...formData, 'Email': e.target.value})}
                        />
                      </div>

                      <div>
                        <label className={labelStyles}>Status</label>
                        <select
                          className={inputStyles}
                          value={formData['Status']}
                          onChange={(e) => setFormData({...formData, 'Status': e.target.value})}
                        >
                          <option value="">Select Status</option>
                          {Object.values(STATUS.STATUS).map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={labelStyles}>Item Type</label>
                        <select
                          className={inputStyles}
                          value={formData['Item Type']}
                          onChange={(e) => setFormData({...formData, 'Item Type': e.target.value})}
                        >
                          <option value="">Select Item Type</option>
                          {ITEM_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={labelStyles}>Brand</label>
                        <input
                          type="text"
                          className={inputStyles}
                          value={formData['Brand']}
                          onChange={(e) => setFormData({...formData, 'Brand': e.target.value})}
                        />
                      </div>

                      <div>
                        <label className={labelStyles}>Price Quote</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className={inputStyles}
                          value={formData['Price Quote']}
                          onChange={(e) => setFormData({...formData, 'Price Quote': parseFloat(e.target.value)})}
                        />
                      </div>

                      <div>
                        <label className={labelStyles}>Final Price</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className={inputStyles}
                          value={formData['Final Price']}
                          onChange={(e) => setFormData({...formData, 'Final Price': parseFloat(e.target.value)})}
                        />
                      </div>

                      <div>
                        <label className={labelStyles}>Type of Item</label>
                        <input
                          type="text"
                          className={inputStyles}
                          value={formData['Type of Item']}
                          onChange={(e) => setFormData({...formData, 'Type of Item': e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className={labelStyles}>Damage or Defect</label>
                        <textarea
                          className={inputStyles}
                          value={formData['Damage or Defect']}
                          onChange={(e) => setFormData({...formData, 'Damage or Defect': e.target.value})}
                        />
                      </div>

                      <div>
                        <label className={labelStyles}>Payment type</label>
                        <select
                          className={inputStyles}
                          value={formData['Payment type']}
                          onChange={(e) => setFormData({...formData, 'Payment type': e.target.value})}
                        >
                          <option value="">Select Payment Type</option>
                          {PAYMENT_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={labelStyles}>Telephone</label>
                        <input
                          type="tel"
                          className={inputStyles}
                          value={formData['Telephone']}
                          onChange={(e) => setFormData({...formData, 'Telephone': e.target.value})}
                        />
                      </div>

                      <div>
                        <label className={labelStyles}>Weight (Ounces)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          className={inputStyles}
                          value={formData['Weight (Ounces)']}
                          onChange={(e) => setFormData({...formData, 'Weight (Ounces)': parseFloat(e.target.value)})}
                        />
                      </div>

                      <div>
                        <label className={labelStyles}>Color</label>
                        <input
                          type="text"
                          className={inputStyles}
                          value={formData['Color']}
                          onChange={(e) => setFormData({...formData, 'Color': e.target.value})}
                        />
                      </div>

                      <div>
                        <label className={labelStyles}>Photo/Attachment</label>
                        <input
                          type="url"
                          className={inputStyles}
                          placeholder="Enter image URL"
                          onChange={(e) => {
                            if (e.target.value) {
                              setFormData({
                                ...formData,
                                'Photo/Attachment': [{
                                  url: e.target.value
                                }]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                'Photo/Attachment': []
                              });
                            }
                          }}
                        />
                      </div>

                      <div>
                        <label className={labelStyles}>Referred By</label>
                        <input
                          type="text"
                          className={inputStyles}
                          value={formData['Referred By']}
                          onChange={(e) => setFormData({...formData, 'Referred By': e.target.value})}
                        />
                      </div>

                      <div>
                        <label className={labelStyles}>Requestor Type</label>
                        <select
                          className={inputStyles}
                          value={formData['Requestor Type']}
                          onChange={(e) => setFormData({...formData, 'Requestor Type': e.target.value})}
                        >
                          <option value="">Select Requestor Type</option>
                          {REQUESTOR_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={labelStyles}>Submitted On</label>
                        <input
                          type="date"
                          className={inputStyles}
                          value={formData['Submitted On']}
                          onChange={(e) => setFormData({...formData, 'Submitted On': e.target.value})}
                        />
                      </div>

                      <div>
                        <label className={labelStyles}>Delivery of Item</label>
                        <select
                          className={inputStyles}
                          value={formData['Delivery of Item']}
                          onChange={(e) => setFormData({...formData, 'Delivery of Item': e.target.value})}
                        >
                          <option value="">Select Delivery Method</option>
                          {DELIVERY_OPTIONS.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={labelStyles}>(For Zapier)</label>
                        <input
                          type="datetime-local"
                          className={inputStyles}
                          value={formData['(For Zapier)']}
                          onChange={(e) => setFormData({...formData, '(For Zapier)': e.target.value})}
                        />
                      </div>

                      <div>
                        <label className={labelStyles}>Amount Paid</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className={inputStyles}
                          value={formData['Amount Paid']}
                          onChange={(e) => setFormData({...formData, 'Amount Paid': parseFloat(e.target.value)})}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Repair Ticket'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
