'use client';

import { Dialog } from '@headlessui/react';

export default function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Delete', 
  message = 'Are you sure you want to delete this item?' 
}) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6">
          <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
            {title}
          </Dialog.Title>
          
          <p className="text-sm text-gray-500 mb-6">
            {message}
          </p>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border border-gray-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
            >
              Delete
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 