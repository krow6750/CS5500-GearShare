import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { airtableService } from '@/lib/airtable/airtableService';
import { activityService } from '@/lib/activity/activityService';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DeleteRepairModal({ isOpen, onClose, repair, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    if (!repair) return;
    
    setLoading(true);
    setError(null);

    try {
      // Create log details
      const logDetails = {
        repair_ticket_id: repair['Repair ID'],
        deleted_at: new Date().toISOString(),
        type_of_item: repair['Type of Item'],
        brand: repair['Brand'],
        damage_or_defect: repair['Damage or Defect'],
        status: repair['Status']
      };

      // Find and delete from Airtable
      const airtableRecord = await airtableService.findRepairByTicketId(repair['Repair ID']);
      
      if (airtableRecord) {
        await airtableService.deleteRepairTicket(airtableRecord.id);
      }

      // Log the deletion
      await activityService.logActivity({
        action_type: 'delete',
        description: `Deleted repair ticket #${repair['Repair ID']}`,
        details: logDetails
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Delete operation failed:', error);
      setError(error.message || 'Failed to delete repair. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-slate-900/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm w-full rounded-lg bg-white p-6 shadow-lg">
          <Dialog.Title className="text-xl font-semibold text-slate-900 mb-4">
            Delete Repair Ticket
          </Dialog.Title>

          <p className="text-slate-600 mb-6">
            Are you sure you want to delete repair ticket #{repair?.repair_ticket_id}? This action cannot be undone.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 w-[100px] justify-center h-9"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 