'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { firebaseDB } from '@/lib/firebase/db';
import { COLLECTIONS, STATUS } from '@/lib/firebase/models';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { generateId } from '@/lib/utils/generateId';

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

export default function AddEquipmentModal({ isOpen, onClose, onSuccess }) {
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState(() => ({
    name: '',
    equipment_category: '',
    status: STATUS.EQUIPMENT.AVAILABLE,
    current_owned_user_id: null,
    price: '',
    description: '',
    quantity: ''
  }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    'Camera',
    'Lens',
    'Lighting',
    'Audio',
    'Grip',
    'Accessories',
    'Drones',
    'Other'
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePriceChange = (e) => {
    const value = e.target.value;
    if (value === '' || (!isNaN(value) && Number(value) >= 0)) {
      setFormData(prev => ({
        ...prev,
        price: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const quantity = parseInt(formData.quantity);
    if (isNaN(quantity) || quantity < 1) {
      setError('Please enter a valid quantity (minimum 1)');
      setLoading(false);
      return;
    }
    
    try {
      const equipmentData = {
        name: formData.name,
        equipment_category: formData.equipment_category,
        status: formData.status,
        price: parseFloat(formData.price) || 0,
        description: formData.description || '',
        quantity: quantity,
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      };

      console.log('Submitting equipment data:', equipmentData);

      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(equipmentData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create equipment');
      }

      const result = await response.json();
      console.log('API response:', result);

      if (!result.booqableId) {
        console.warn('Equipment created but missing Booqable ID');
        setError('Equipment was created but Booqable sync may have failed');
      }

      setFormData({
        name: '',
        equipment_category: '',
        status: STATUS.EQUIPMENT.AVAILABLE,
        current_owned_user_id: null,
        price: '',
        description: '',
        quantity: ''
      });
      
      if (onSuccess) {
        onSuccess(result);
      }
      onClose();
    } catch (error) {
      console.error('Equipment creation failed:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-slate-900/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-3xl w-full rounded-lg bg-white p-6 shadow-lg">
          <Dialog.Title className="text-xl font-semibold text-slate-900 mb-6">
            Add New Equipment
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
                  <div>
                    <label className={labelStyles}>Name</label>
                    <input
                      type="text"
                      required
                      className={inputStyles}
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className={labelStyles}>Category</label>
                    <select
                      required
                      className={inputStyles}
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
                    <label className={labelStyles}>Description</label>
                    <textarea
                      className={inputStyles}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className={labelStyles}>Price (per day)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      className={inputStyles}
                      value={formData.price}
                      onChange={handlePriceChange}
                      placeholder="Enter price per day"
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
                      <option value={STATUS.EQUIPMENT.AVAILABLE}>Available</option>
                      <option value={STATUS.EQUIPMENT.RENTED}>Rented</option>
                      <option value={STATUS.EQUIPMENT.IN_REPAIR}>In Repair</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelStyles}>Quantity</label>
                    <input
                      type="number"
                      required
                      className={inputStyles}
                      value={formData.quantity}
                      onChange={(e) => setFormData({
                        ...formData,
                        quantity: e.target.value
                      })}
                    />
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
                  {loading ? 'Adding...' : 'Add Equipment'}
                </button>
              </div>
            </form>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 