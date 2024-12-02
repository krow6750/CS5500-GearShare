'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { firebaseDB } from '@/lib/firebase/db';
import { COLLECTIONS, STATUS } from '@/lib/firebase/models';
import { syncService } from '@/lib/sync/syncService';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function EditEquipmentModal({ isOpen, onClose, equipment, onSuccess }) {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    equipment_id: '',
    name: '',
    equipment_category: '',
    status: STATUS.EQUIPMENT.AVAILABLE,
    current_owned_user_id: null,
    price: 0,
    airtableId: '',
    booqableId: ''
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (equipment && isMounted) {
      setFormData(equipment);
    }
  }, [equipment, isMounted]);

  const categories = [
    'Camera',
    'Lens',
    'Lighting',
    'Audio',
    'Grip',
    'Accessories',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Update in Firebase
      await firebaseDB.update(COLLECTIONS.EQUIPMENT, equipment.id, formData);
      
      // Sync with Airtable
      await syncService.syncWithAirtable('equipment', {
        ...formData,
        id: equipment.id
      });
      
      // Log activity
      await syncService.logActivity({
        log_id: Date.now(),
        user_id: 'system',
        action_type: 'update',
        description: `Updated equipment: ${formData.name}`,
        activity_time: new Date().toISOString()
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating equipment:', error);
      setError(`Failed to update equipment: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6">
          <Dialog.Title className="text-lg font-medium mb-4">Edit Equipment</Dialog.Title>
          
          {error && (
            <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {loading ? (
            <LoadingSpinner />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Equipment ID</label>
                <input
                  type="text"
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                  value={formData.equipment_id}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.equipment_category}
                  onChange={(e) => setFormData({...formData, equipment_category: e.target.value})}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value={STATUS.EQUIPMENT.AVAILABLE}>Available</option>
                  <option value={STATUS.EQUIPMENT.RENTED}>Rented</option>
                  <option value={STATUS.EQUIPMENT.IN_REPAIR}>In Repair</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Current Owner ID</label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.current_owned_user_id || ''}
                  onChange={(e) => setFormData({...formData, current_owned_user_id: parseInt(e.target.value) || null})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Airtable ID</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.airtableId || ''}
                  onChange={(e) => setFormData({...formData, airtableId: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Booqable ID</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.booqableId || ''}
                  onChange={(e) => setFormData({...formData, booqableId: e.target.value})}
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 