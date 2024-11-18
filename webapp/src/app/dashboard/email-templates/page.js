'use client';

import { useState, useEffect } from 'react';
import { templateService } from '@/lib/email/templateService';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useSidebar } from '@/contexts/SidebarContext';

export default function EmailTemplatesPage() {
  const { isExpanded } = useSidebar();
  const [isMounted, setIsMounted] = useState(false);
  const [templates, setTemplates] = useState({
    repair_completion: null,
    repair_status: null
  });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editedTemplate, setEditedTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      setIsLoading(true);
      const repairCompletion = await templateService.getTemplate('repair_completion');
      const repairStatus = await templateService.getTemplate('repair_status');
      setTemplates({
        repair_completion: repairCompletion,
        repair_status: repairStatus
      });
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!selectedTemplate || !editedTemplate) return;
    
    try {
      await templateService.updateTemplate(selectedTemplate, editedTemplate);
      await loadTemplates();
      setSelectedTemplate(null);
      setEditedTemplate(null);
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  }

  if (!isMounted) return null;
  if (isLoading) return <LoadingSpinner />;

  return (
    <div className={`
      transition-all duration-300
      ${isExpanded ? 'ml-64' : 'ml-20'}
      pr-8 pl-8
    `}>
      {/* Header Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Email Templates</h1>
            <p className="text-sm text-slate-600 mt-1">
              Customize notification templates for repairs and rentals
            </p>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(templates).map(([id, template]) => (
          template && (
            <div key={id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{template.name}</h2>
                  <p className="text-sm text-slate-600 mt-1">Subject: {template.subject}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedTemplate(id);
                    setEditedTemplate(template);
                  }}
                  className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors"
                >
                  Edit Template
                </button>
              </div>
              <div className="bg-slate-50 p-4 rounded-md">
                <pre className="text-sm text-slate-600 whitespace-pre-wrap">
                  {template.template}
                </pre>
              </div>
            </div>
          )
        ))}
      </div>

      {/* Edit Modal */}
      {selectedTemplate && editedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Edit Template</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={editedTemplate.subject}
                onChange={(e) => setEditedTemplate({
                  ...editedTemplate,
                  subject: e.target.value
                })}
                className="w-full border border-slate-200 rounded-md p-2 text-slate-900"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Template
              </label>
              <textarea
                value={editedTemplate.template}
                onChange={(e) => setEditedTemplate({
                  ...editedTemplate,
                  template: e.target.value
                })}
                rows={10}
                className="w-full border border-slate-200 rounded-md p-2 font-mono text-sm text-slate-900"
              />
              <p className="text-sm text-slate-700 mt-1">
                Available variables: {'{{ticketId}}, {{status}}, {{equipmentType}}, {{notes}}, {{completionDate}}'}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedTemplate(null);
                  setEditedTemplate(null);
                }}
                className="px-4 py-2 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 