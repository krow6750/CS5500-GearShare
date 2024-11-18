'use client';

import { Dialog } from '@headlessui/react';
import { firebaseDB } from '@/lib/firebase/db';
import { COLLECTIONS } from '@/lib/firebase/models';

export default function DeleteRentalModal({ isOpen, onClose, rental, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      // Delete from Booqable first if we have a booqableId
      if (rental.booqableId) {
        await fetch('/api/booqable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: `/orders/${rental.booqableId}/cancel`,
            method: 'POST'
          })
        });
      }

      // Delete from Firebase
      await firebaseDB.delete(COLLECTIONS.RENTALS, rental.id);

      // Log activity
      await firebaseDB.create(COLLECTIONS.ACTIVITY_LOGS, {
        log_id: Date.now(),
        user_id: 'system',
        action_type: 'delete',
        description: `Deleted rental #${rental.rental_id}`,
        activity_time: new Date().toISOString()
      });

      onSuccess();
      onClose();
    } catch (error) {
      setError(`Failed to delete rental: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6">
          <Dialog.Title className="text-lg font-medium mb-4">
            Delete Rental
          </Dialog.Title>
          
          <p className="text-sm text-gray-500 mb-4">
            Are you sure you want to delete rental #{rental?.rental_id}? This action cannot be undone.
          </p>

          {error && (
            <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border border-gray-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 