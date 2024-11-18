import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { firebaseDB } from '@/lib/firebase/db';
import { COLLECTIONS } from '@/lib/firebase/models';
import { airtableService } from '@/lib/airtable/airtableService';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DeleteRepairModal({ isOpen, onClose, repair, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    if (!repair) return;
    
    setLoading(true);
    setError(null);

    try {
      // Store repair data before deletion for logging
      const repairData = await firebaseDB.get(COLLECTIONS.REPAIRS, repair.id);
      
      // Create log details with null checks
      const logDetails = {
        repair_id: repair.id,
        repair_ticket_id: repair.repair_ticket_id,
        deleted_at: new Date().toISOString()
      };

      // Only add fields if they exist in repairData
      if (repairData) {
        if (repairData.equipment_type) logDetails.equipment_type = repairData.equipment_type;
        if (repairData.equipment_name) logDetails.equipment_name = repairData.equipment_name;
        if (repairData.reported_by) logDetails.reported_by = repairData.reported_by;
        if (repairData.status) logDetails.status = repairData.status;
        if (repairData.issue_description) logDetails.issue_description = repairData.issue_description;
      }

      // Step 1: Find and delete from Airtable first
      const airtableRecord = await airtableService.findRepairByTicketId(repair.repair_ticket_id);
      
      if (airtableRecord) {
        await airtableService.deleteRepairTicket(airtableRecord.id);
      }

      // Step 2: Delete from Firebase
      await firebaseDB.delete(COLLECTIONS.REPAIRS, repair.id);

      // Step 3: Log the deletion with verified data
      await firebaseDB.create(COLLECTIONS.ACTIVITY_LOGS, {
        log_id: Date.now(),
        user_id: 'system',
        action_type: 'delete',
        collection: 'repairs',
        description: `Deleted repair ticket #${repair.repair_ticket_id}`,
        details: logDetails,
        activity_time: new Date().toISOString()
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