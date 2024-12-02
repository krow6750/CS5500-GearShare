'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import booqableService from '@/lib/booqable/booqableService';

export default function EditRentalModal({ isOpen, onClose, rental, onSuccess }) {
  const [startDate, setStartDate] = useState(rental?.starts_at?.split('T')[0] || '');
  const [endDate, setEndDate] = useState(rental?.stops_at?.split('T')[0] || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await booqableService.updateOrder(rental.id, {
        starts_at: `${startDate}T00:00:00Z`,
        stops_at: `${endDate}T23:59:59Z`
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating rental dates:', error);
      setError(error.message || 'Failed to update rental dates');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when rental changes
  useState(() => {
    if (rental) {
      setStartDate(rental.starts_at?.split('T')[0] || '');
      setEndDate(rental.stops_at?.split('T')[0] || '');
    }
  }, [rental]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Edit Rental Dates</h2>
        <p className="text-sm text-slate-600 mb-4">
          Order #{rental?.number}
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}