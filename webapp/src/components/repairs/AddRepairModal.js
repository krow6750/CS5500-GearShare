'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { firebaseDB } from '@/lib/firebase/db';
import { COLLECTIONS, STATUS } from '@/lib/firebase/models';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { generateId } from '@/lib/utils/dateFormat';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { repairService } from '@/lib/services/repairService';
import { airtableService } from '@/lib/airtable/airtableService';

// Matching styles from AddRentalModal
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

// Reuse SearchableSelect component
function SearchableSelect({ options, value, onChange, label, placeholder, renderOption }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = options.filter(option => 
    renderOption(option).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.id === value);

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
        />
        <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute right-3 top-2.5" />
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 overflow-auto focus:outline-none border border-slate-300">
          {filteredOptions.map((option) => (
            <div
              key={option.id}
              className={`cursor-pointer select-none relative py-2.5 px-3 text-base hover:bg-slate-50 ${
                value === option.id ? 'bg-slate-50 text-slate-900 font-medium' : 'text-slate-900'
              }`}
              onClick={() => {
                onChange(option.id);
                setSearchTerm(renderOption(option));
                setIsOpen(false);
              }}
            >
              {renderOption(option)}
            </div>
          ))}
        </div>
      )}

      {!isOpen && selectedOption && (
        <div className="mt-2 px-3 py-2 text-base text-slate-900 bg-slate-50 border border-slate-200 rounded-md">
          {renderOption(selectedOption)}
        </div>
      )}
    </div>
  );
}

export default function AddRepairModal({ isOpen, onClose, onSuccess }) {
  const [isMounted, setIsMounted] = useState(false);
  const [equipment, setEquipment] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    repair_ticket_id: '',
    equipment_id: '',
    reported_by: '',
    assigned_to: '',
    issue_description: '',
    start_date: '',
    end_date: '',
    status: STATUS.REPAIR.PENDING,
    cost: '',
    estimate_repair_time: '',
    airtableId: ''
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

  useEffect(() => {
    setIsMounted(true);
    if (isMounted) {
      setFormData(prev => ({
        ...prev,
        repair_ticket_id: generateId(),
        start_date: new Date().toISOString().split('T')[0]
      }));
    }
  }, [isMounted]);

  if (!isMounted) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const repairTicketId = formData.repair_ticket_id || generateId('REP');
      
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
      
      const repairData = {
        repair_ticket_id: repairTicketId,
        equipment_type: equipment.find(e => e.id === formData.equipment_id)?.equipment_category || '',
        reported_by: formData.reported_by,
        assigned_to: formData.assigned_to,
        issue_description: formData.issue_description,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        status: formData.status,
        cost: cost,
        estimate_repair_time: estimatedTime
      };

      // Create in Airtable first to get the ID
      let airtableRecord;
      try {
        airtableRecord = await airtableService.createRepairTicket(repairData);
        console.log('Airtable record created:', airtableRecord);
      } catch (airtableError) {
        console.error('Failed to create in Airtable:', airtableError);
      }

      // Create in Firebase with Airtable ID
      const result = await repairService.createRepair({
        ...repairData,
        airtableId: airtableRecord?.id
      });

      if (onSuccess) {
        onSuccess(result);
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
        <Dialog.Panel className="mx-auto max-w-3xl w-full rounded-lg bg-white p-6 shadow-lg">
          <Dialog.Title className="text-xl font-semibold text-slate-900 mb-6">
            Create Repair Ticket
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
                  <SearchableSelect
                    options={equipment}
                    value={formData.equipment_id}
                    onChange={(id) => setFormData({...formData, equipment_id: id})}
                    label="Equipment"
                    placeholder="Search equipment..."
                    renderOption={(item) => `${item.name} (${item.equipment_category})`}
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
                    <SearchableSelect
                      options={users}
                      value={formData.reported_by}
                      onChange={(id) => setFormData({...formData, reported_by: id})}
                      label="Reported By"
                      placeholder="Search users..."
                      renderOption={(user) => user.name}
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
                        value={formData.end_date}
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
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData({
                            ...formData,
                            estimate_repair_time: value
                          });
                        }}
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
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData({
                            ...formData,
                            cost: value
                          });
                        }}
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
                  {loading ? 'Creating...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
