'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { firebaseDB } from '@/lib/firebase/db';
import { COLLECTIONS, STATUS } from '@/lib/firebase/models';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { emailService } from '@/lib/email/emailService';
import { activityService } from '@/lib/activity/activityService';
import { airtableService } from '@/lib/airtable/airtableService';

// Reuse the same styles
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

// Reuse SearchableSelect component from AddRepairModal
function SearchableSelect({ options, value, onChange, label, placeholder, renderOption, disabled }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = options.filter(option => 
    renderOption(option).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.id === value);

  // If disabled, just show the selected value
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

// Add this new component for read-only fields
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

export default function EditRepairModal({ isOpen, onClose, repair, onSuccess }) {
  const [isMounted, setIsMounted] = useState(false);
  const [equipment, setEquipment] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    repair_ticket_id: '',
    equipment_id: '',
    equipment_type: '',
    reported_by: '',
    assigned_to: '',
    issue_description: '',
    start_date: '',
    end_date: '',
    status: STATUS.REPAIR.PENDING,
    cost: '0',
    estimate_repair_time: '1'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load equipment and users
  useEffect(() => {
    const loadData = async () => {
      try {
        const [equipmentData, usersData] = await Promise.all([
          firebaseDB.query(COLLECTIONS.EQUIPMENT),
          firebaseDB.query(COLLECTIONS.USERS)
        ]);
        setEquipment(equipmentData);
        setUsers(usersData);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data');
      }
    };
    loadData();
  }, []);

  // Update form when repair data changes
  useEffect(() => {
    if (repair && isMounted) {
      setFormData({
        ...repair,
        start_date: repair.start_date ? new Date(repair.start_date).toISOString().split('T')[0] : '',
        end_date: repair.end_date ? new Date(repair.end_date).toISOString().split('T')[0] : '',
        cost: repair.cost?.toString() || '0',
        estimate_repair_time: repair.estimate_repair_time?.toString() || '1'
      });
    }
  }, [repair, isMounted]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Store previous state for logging
      const previousState = await firebaseDB.get(COLLECTIONS.REPAIRS, repair.id);

      const cost = parseFloat(formData.cost);
      const estimatedTime = parseInt(formData.estimate_repair_time);
      
      if (isNaN(cost) || cost < 0) {
        setError('Please enter a valid cost amount');
        setLoading(false);
        return;
      }

      if (isNaN(estimatedTime) || estimatedTime < 0) {
        setError('Please enter a valid estimated repair time');
        setLoading(false);
        return;
      }

      const updateData = {
        equipment_type: equipment.find(e => e.id === formData.equipment_id)?.equipment_category || '',
        reported_by: formData.reported_by,
        assigned_to: formData.assigned_to,
        issue_description: formData.issue_description,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        status: formData.status,
        cost: cost,
        estimate_repair_time: estimatedTime,
        last_updated: new Date().toISOString()
      };

      // Update in Airtable
      try {
        const airtableRecord = await airtableService.findRepairByTicketId(repair.repair_ticket_id);
        if (airtableRecord) {
          await airtableService.updateRepairTicket(airtableRecord.id, {
            ...updateData,
            repair_ticket_id: repair.repair_ticket_id
          });
        }
      } catch (airtableError) {
        console.error('Failed to update in Airtable:', airtableError);
      }

      // Update in Firebase
      await firebaseDB.update(COLLECTIONS.REPAIRS, repair.id, updateData);

      // Log the update
      await firebaseDB.create(COLLECTIONS.ACTIVITY_LOGS, {
        log_id: Date.now(),
        user_id: 'system', // or get from auth context if available
        action_type: 'update',
        collection: 'repairs',
        description: `Updated repair ticket #${repair.repair_ticket_id}`,
        details: {
          repair_id: repair.id,
          repair_ticket_id: repair.repair_ticket_id,
          previous_state: {
            status: previousState.status,
            assigned_to: previousState.assigned_to,
            cost: previousState.cost,
            estimate_repair_time: previousState.estimate_repair_time
          },
          new_state: {
            status: updateData.status,
            assigned_to: updateData.assigned_to,
            cost: updateData.cost,
            estimate_repair_time: updateData.estimate_repair_time
          },
          equipment_type: updateData.equipment_type,
          reported_by: updateData.reported_by,
          updated_at: updateData.last_updated,
          changes: Object.keys(updateData).filter(key => 
            updateData[key] !== previousState[key]
          )
        },
        activity_time: new Date().toISOString()
      });

      // Send email notification
      try {
        const user = await firebaseDB.get(COLLECTIONS.USERS, formData.reported_by);
        if (user?.email) {
          await emailService.sendRepairUpdate({
            repair_ticket_id: repair.repair_ticket_id,
            status: formData.status,
            equipment_type: updateData.equipment_type,
            notes: formData.issue_description
          }, user.email);
        }
      } catch (emailError) {
        console.warn('Failed to send email notification:', emailError);
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

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-slate-900/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-3xl w-full rounded-lg bg-white p-6 shadow-lg">
          <Dialog.Title className="text-xl font-semibold text-slate-900 mb-6">
            Edit Repair Ticket #{formData.repair_ticket_id}
          </Dialog.Title>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <LoadingSpinner />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <ReadOnlyField
                    label="Equipment"
                    value={`${equipment.find(e => e.id === formData.equipment_id)?.name || ''} (${formData.equipment_type})`}
                  />

                  <div>
                    <label className={labelStyles}>Issue Description</label>
                    <textarea
                      required
                      rows={3}
                      className={inputStyles}
                      value={formData.issue_description}
                      onChange={(e) => setFormData({...formData, issue_description: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className={labelStyles}>Status</label>
                    <select
                      required
                      className={inputStyles}
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value={STATUS.REPAIR.PENDING}>Pending</option>
                      <option value={STATUS.REPAIR.IN_PROGRESS}>In Progress</option>
                      <option value={STATUS.REPAIR.COMPLETED}>Completed</option>
                    </select>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <ReadOnlyField
                      label="Reported By"
                      value={users.find(u => u.id === formData.reported_by)?.name || 'Unknown'}
                    />

                    <SearchableSelect
                      options={users}
                      value={formData.assigned_to}
                      onChange={(id) => setFormData({...formData, assigned_to: id})}
                      label="Assigned To"
                      placeholder="Search users..."
                      renderOption={(user) => user.name}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelStyles}>Start Date</label>
                      <input
                        type="date"
                        required
                        className={inputStyles}
                        value={formData.start_date}
                        onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className={labelStyles}>End Date</label>
                      <input
                        type="date"
                        className={inputStyles}
                        value={formData.end_date || ''}
                        onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelStyles}>Est. Time (hours)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        className={inputStyles}
                        value={formData.estimate_repair_time}
                        onChange={(e) => setFormData({
                          ...formData, 
                          estimate_repair_time: e.target.value || '0'
                        })}
                      />
                    </div>

                    <div>
                      <label className={labelStyles}>Cost ($)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        className={inputStyles}
                        value={formData.cost}
                        onChange={(e) => setFormData({
                          ...formData, 
                          cost: e.target.value || '0'
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-base font-medium text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2.5 text-base font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}