'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { STATUS } from '@/lib/airtable/models';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { airtableService } from '@/lib/airtable/airtableService';
import { activityService } from '@/lib/activity/activityService';
import { emailServices } from '@/lib/email/emailService';
import { useQuery } from '@tanstack/react-query';
import { emailTemplateService } from '@/lib/airtable/emailTemplateServices';

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

function SearchableSelect({ options, value, onChange, label, placeholder, renderOption, disabled }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = options.filter(option => 
    renderOption(option).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.id === value);

  if (disabled && selectedOption) {
    return (
      <div className="relative">
        <label className={labelStyles}>{label}</label>
        <div className="px-3 py-2.5 text-base text-slate-900 bg-slate-100 border border-slate-200 rounded-md">
          {renderOption(selectedOption)}
        </div>
      </div>
    );
  }

  const handleOptionClick = (option) => {
    if (onChange && !disabled) {
      onChange(option.id);
      setSearchTerm(renderOption(option));
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <label className={labelStyles}>{label}</label>
      
      <div className="relative">
        <input
          type="text"
          className={inputStyles}
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
        />
        <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute right-3 top-2.5" />
      </div>

      {isOpen && !disabled && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 overflow-auto focus:outline-none border border-slate-300">
          {filteredOptions.map((option) => (
            <div
              key={option.id}
              className={`cursor-pointer select-none relative py-2.5 px-3 text-base hover:bg-slate-50 ${
                value === option.id ? 'bg-slate-50 text-slate-900 font-medium' : 'text-slate-900'
              }`}
              onClick={() => handleOptionClick(option)}
            >
              {renderOption(option)}
            </div>
          ))}
        </div>
      )}

      {!isOpen && selectedOption && !disabled && (
        <div className="mt-2 px-3 py-2 text-base text-slate-900 bg-slate-50 border border-slate-200 rounded-md">
          {renderOption(selectedOption)}
        </div>
      )}
    </div>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div className="relative">
      <label className={labelStyles}>{label}</label>
      <div className="px-3 py-2.5 text-base text-slate-900 bg-slate-100 border border-slate-200 rounded-md">
        {value}
      </div>
    </div>
  );
}

export default function EditRepairModal({ 
  isOpen, 
  onClose, 
  repair, 
  onSuccess, 
  completedTemplate, 
  setSelectedCompletedTemplate
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(completedTemplate);
  const [previousStatus, setPreviousStatus] = useState('');
  const [formData, setFormData] = useState({
    'First Name': '',
    'Last Name': '',
    'Email': '',
    'Telephone': '',
    'Item Type': '',
    'Brand': '',
    'Color': '',
    'Weight (Ounces)': 0,
    'Damage or Defect': '',
    'Internal Notes': '',
    'Photo/Attachment': [],
    'Delivery of Item': '',
    'Status': STATUS.STATUS['Dropped Off, Awaiting Repair'],
    'Price Quote': 0,
    'Final Price': 0,
    'Amount Paid': 0,
    'Payment type': '',
    'Referred By': '',
    'Requestor Type': '',
    'Repair ID': '',
    '(For Zapier)': '',
    'Type of Item': '',
    'Date Quoted': new Date().toISOString().split('T')[0]
  });

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


  const completedRepairTemplates = templates?.filter(
    template => template.templateType === "Completed Repair Email Template"
  ).sort((a, b) => a.templateName.localeCompare(b.templateName));

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (repair && isMounted) {
      setFormData({
        'First Name': repair.fields['First Name'] || '',
        'Last Name': repair.fields['Last Name'] || '',
        'Email': repair.fields['Email'] || '',
        'Telephone': repair.fields['Telephone'] || '',
        'Item Type': repair.fields['Item Type'] || '',
        'Brand': repair.fields['Brand'] || '',
        'Color': repair.fields['Color'] || '',
        'Weight (Ounces)': repair.fields['Weight (Ounces)'] || 0,
        'Damage or Defect': repair.fields['Damage or Defect'] || '',
        'Internal Notes': repair.fields['Internal Notes'] || '',
        'Photo/Attachment': repair.fields['Photo/Attachment'] || [],
        'Delivery of Item': repair.fields['Delivery of Item'] || '',
        'Status': repair.fields['Status'] || STATUS.STATUS['Dropped Off, Awaiting Repair'],
        'Price Quote': repair.fields['Price Quote'] || 0,
        'Final Price': repair.fields['Final Price'] || 0,
        'Amount Paid': repair.fields['Amount Paid'] || 0,
        'Payment type': repair.fields['Payment type'] || '',
        'Referred By': repair.fields['Referred By'] || '',
        'Requestor Type': repair.fields['Requestor Type'] || '',
        'Repair ID': repair.fields['Repair ID'] || '',
        '(For Zapier)': repair.fields['(For Zapier)'] || '',
        'Type of Item': repair.fields['Type of Item'] || '',
        'Date Quoted': repair.fields['Date Quoted'] ? 
          new Date(repair.fields['Date Quoted']).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0]
      });
    }
  }, [repair, isMounted]);

  useEffect(() => {
    if (repair) {
      setPreviousStatus(repair.fields['Status']);
    }
  }, [repair]);

  useEffect(() => {
    if (completedTemplate) {
      setSelectedTemplate(completedTemplate);
    }
  }, [completedTemplate]);

  if (!isMounted) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updateData = {
        'First Name': formData['First Name'],
        'Last Name': formData['Last Name'],
        'Email': formData['Email'],
        'Telephone': formData['Telephone'],
        'Item Type': formData['Item Type'],
        'Brand': formData['Brand'],
        'Color': formData['Color'],
        'Weight (Ounces)': formData['Weight (Ounces)'],
        'Damage or Defect': formData['Damage or Defect'],
        'Internal Notes': formData['Internal Notes'],
        'Photo/Attachment': formData['Photo/Attachment'],
        'Delivery of Item': formData['Delivery of Item'],
        'Status': formData['Status'],
        'Price Quote': formData['Price Quote'],
        'Final Price': formData['Final Price'],
        'Amount Paid': formData['Amount Paid'],
        'Payment type': formData['Payment type'],
        'Referred By': formData['Referred By'],
        'Requestor Type': formData['Requestor Type'],
        'Repair ID': formData['Repair ID'],
        '(For Zapier)': formData['(For Zapier)'],
        'Type of Item': formData['Type of Item'],
        'Date Quoted': formData['Date Quoted'],
        'Completed Repair Template': completedTemplate,
        'Sent Email': false
      };
      
      if (formData['Status'] === STATUS.STATUS['Finished, Customer Contacted'] && 
          formData['Status'] !== previousStatus &&
          formData['Email'] &&
          selectedTemplate) {
        
        try {
          await emailServices.sendEmail({
            templateName: selectedTemplate,
            recipients: formData['Email'],
            firstName: formData['First Name'] || '',
            lastName: formData['Last Name'] || '',
            finalPrice: formData['Final Price'] || 0,
            repairId: formData['Repair ID'] || '',
            itemType: formData['Item Type'] || '',
            paymentType: formData['Payment type'] || '',
            status: formData['Status'] || '',
            notes: formData['Internal Notes'] || ''
          });
          
          updateData['Sent Email'] = true;
        } catch (emailError) {
          console.error('Failed to send completion email:', emailError);
        }
      }

      if (repair && repair.id) {
        await airtableService.updateRepairTicket(repair.id, updateData);

        await activityService.logRepairActivity('update', {
          fields: updateData,
          details: generateUpdateDetails(repair.fields, updateData)
        });
      } else {
        throw new Error('No repair ID found');
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error('Failed to update repair:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateUpdateDetails = (oldData, newData) => {
    const changes = [];
    
    const numbersDiffer = (a, b) => {
      const numA = parseFloat(a || 0).toFixed(2);
      const numB = parseFloat(b || 0).toFixed(2);
      return numA !== numB;
    };

    Object.keys(newData).forEach(key => {
      if (oldData[key] === newData[key]) return;
      
      if (['(For Zapier)', 'Sent Email', 'Completed Repair Template'].includes(key)) return;

      switch (key) {
        case 'First Name':
        case 'Last Name':
          if (!changes.some(change => change.includes('name changed'))) {
            const oldFullName = `${oldData['First Name'] || ''} ${oldData['Last Name'] || ''}`.trim();
            const newFullName = `${newData['First Name'] || ''} ${newData['Last Name'] || ''}`.trim();
            if (oldFullName !== newFullName) {
              changes.push(`name changed from "${oldFullName}" to "${newFullName}"`);
            }
          }
          break;

        case 'Status':
          if (oldData[key] !== newData[key]) {
            changes.push(`Status changed from "${oldData[key] || 'Not Set'}" to "${newData[key]}"`);
          }
          break;

        case 'Price Quote':
          if (numbersDiffer(oldData[key], newData[key])) {
            changes.push(`Price Quote updated from $${oldData[key] || 0} to $${newData[key]}`);
          }
          break;

        case 'Final Price':
          if (numbersDiffer(oldData[key], newData[key])) {
            changes.push(`Final Price updated from $${oldData[key] || 0} to $${newData[key]}`);
          }
          break;

        case 'Amount Paid':
          if (numbersDiffer(oldData[key], newData[key])) {
            changes.push(`Amount Paid updated from $${oldData[key] || 0} to $${newData[key]}`);
          }
          break;

        case 'Item Type':
          if (oldData[key] !== newData[key]) {
            changes.push(`Item Type changed from "${oldData[key] || 'Not Set'}" to "${newData[key]}"`);
          }
          break;

        case 'Email':
        case 'Telephone':
        case 'Brand':
        case 'Color':
        case 'Damage or Defect':
        case 'Internal Notes':
        case 'Delivery of Item':
        case 'Payment type':
        case 'Requestor Type':
          if (oldData[key] !== newData[key]) {
            const oldValue = oldData[key] || 'Not Set';
            const newValue = newData[key] || 'Not Set';
            if (oldValue !== newValue) {
              changes.push(`${key} updated from "${oldValue}" to "${newValue}"`);
            }
          }
          break;
      }
    });

    return changes;
  };

  const handleTemplateChange = (e) => {
    const newValue = e.target.value;
    setSelectedTemplate(newValue);
    if (setSelectedCompletedTemplate) {
      setSelectedCompletedTemplate(newValue);
    }
  };

  const statusOptions = [
    STATUS.STATUS['Finished, Picked Up'],
    STATUS.STATUS['Contacted, Awaiting Customer Response'],
    STATUS.STATUS['Awaiting Drop-Off'],
    STATUS.STATUS['Can\'t Repair'],
    STATUS.STATUS['Finished + Paid, In Drop-Box'],
    STATUS.STATUS['Dropped Off, Awaiting Repair'],
    STATUS.STATUS['Finished, Customer Contacted'],
    STATUS.STATUS['In Repair']
  ];

  console.log('Templates Data:', {
    allTemplates: templates,
    completedRepairTemplates,
    templateTypes: templates?.map(t => t.templateType)
  });

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-slate-900/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-3xl w-full rounded-lg bg-white shadow-lg">
          <div className="p-6 flex flex-col h-[90vh]">
            <Dialog.Title className="text-xl font-semibold text-slate-900 mb-6 flex-shrink-0">
              Edit Repair Ticket #{formData['Repair ID']}
            </Dialog.Title>
            
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

                  <div className="mb-4">
                    <label className={labelStyles}>Completed Repair Email Template</label>
                    <select
                      className={inputStyles}
                      value={selectedTemplate}
                      onChange={handleTemplateChange}
                    >
                      <option key="default-template" value="">Select Template...</option>
                      {completedRepairTemplates?.map(template => (
                        <option key={`template-${template.id}`} value={template.templateName}>
                          {template.templateName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div>
                        <label className={labelStyles}>Repair ID</label>
                        <input
                          type="text"
                          className={inputStyles}
                          value={formData['Repair ID']}
                          onChange={(e) => setFormData({...formData, 'Repair ID': e.target.value})}
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
                          {statusOptions.map(status => (
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
                          <option key="default-item" value="">Select Item Type</option>
                          {ITEM_TYPES.map(type => (
                            <option key={`item-${type}`} value={type}>{type}</option>
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

                      <div>
                        <label className={labelStyles}>Damage or Defect</label>
                        <textarea
                          className={inputStyles}
                          value={formData['Damage or Defect']}
                          onChange={(e) => setFormData({...formData, 'Damage or Defect': e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className={labelStyles}>Payment type</label>
                        <select
                          className={inputStyles}
                          value={formData['Payment type']}
                          onChange={(e) => setFormData({...formData, 'Payment type': e.target.value})}
                        >
                          <option key="default-payment" value="">Select Payment Type</option>
                          {PAYMENT_TYPES.map(type => (
                            <option key={`payment-${type}`} value={type}>{type}</option>
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
                          onChange={(e) => setFormData({
                            ...formData, 
                            'Weight (Ounces)': parseFloat(e.target.value)
                          })}
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
                          <option key="default-requestor" value="">Select Requestor Type</option>
                          {REQUESTOR_TYPES.map(type => (
                            <option key={`requestor-${type}`} value={type}>{type}</option>
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
                          <option key="default-delivery" value="">Select Delivery Option</option>
                          {DELIVERY_OPTIONS.map(option => (
                            <option key={`delivery-${option}`} value={option}>{option}</option>
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
                    {loading ? 'Saving...' : 'Save Changes'}
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