'use client';

import { useState, useEffect } from 'react';
import { emailTemplateService } from '@/lib/airtable/emailTemplateServices';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useSidebar } from '@/contexts/SidebarContext';

const TEMPLATE_TYPES = [
  'Create Repair Email Template',
  'Completed Repair Email Template'
];

export default function EmailTemplatesPage() {
  const { isExpanded } = useSidebar();
  const [isMounted, setIsMounted] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editedTemplate, setEditedTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    templateName: '',
    templateSubject: '',
    templateBody: '',
    templateType: '' 
  });
  const [textAreaRef, setTextAreaRef] = useState(null);

  useEffect(() => {
    setIsMounted(true);
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      setIsLoading(true);
      const fetchedTemplates = await emailTemplateService.fetchEmailTemplates();
      
      const sortedTemplates = [...fetchedTemplates].sort((a, b) => {
        const aAutonum = parseInt(a.autonumber) || 0;
        const bAutonum = parseInt(b.autonumber) || 0;
        return bAutonum - aAutonum; 
      });
      
      console.log('=== EMAIL TEMPLATES PAGE RESPONSE ===', {
        totalTemplates: sortedTemplates?.length,
        fullResponse: sortedTemplates,
        firstTemplate: sortedTemplates?.[0],
        templateFields: sortedTemplates?.[0] ? Object.keys(sortedTemplates[0]).sort() : [],
        allTemplates: sortedTemplates?.map(template => ({
          id: template.id,
          name: template.templateName,
          subject: template.templateSubject,
          type: template.templateType,
          autonumber: template.autonumber
        }))
      });

      setTemplates(sortedTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!selectedTemplate || !editedTemplate) return;
    
    try {
      await emailTemplateService.updateTemplate(selectedTemplate, editedTemplate);
      await loadTemplates();
      setSelectedTemplate(null);
      setEditedTemplate(null);
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  }

  async function handleCreateTemplate() {
    try {
      await emailTemplateService.createEmailTemplate(
        newTemplate.templateName,
        newTemplate.templateSubject,
        newTemplate.templateBody,
        newTemplate.templateType
      );
      await loadTemplates();
      setIsCreating(false);
      setNewTemplate({ templateName: '', templateSubject: '', templateBody: '', templateType: '' });
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  }

  const insertVariable = (variable) => {
    if (!textAreaRef) return;

    const start = textAreaRef.selectionStart;
    const end = textAreaRef.selectionEnd;
    const currentValue = newTemplate.templateBody;
    const newValue = currentValue.substring(0, start) + variable + currentValue.substring(end);
    
    setNewTemplate({
      ...newTemplate,
      templateBody: newValue
    });

    setTimeout(() => {
      textAreaRef.focus();
      const newCursorPos = start + variable.length;
      textAreaRef.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const variablesList = [
    { var: '{{firstName}}', desc: "Customer's first name" },
    { var: '{{lastName}}', desc: "Customer's last name" },
    { var: '{{finalPrice}}', desc: 'Final repair price' },
    { var: '{{repairId}}', desc: 'Repair ticket ID' },
    { var: '{{itemType}}', desc: 'Type of item' },
    { var: '{{paymentType}}', desc: 'Payment method' },
    { var: '{{status}}', desc: 'Repair status' },
    { var: '{{notes}}', desc: 'Additional notes' }
  ];

  const insertVariableInEdit = (variable) => {
    if (!textAreaRef || !editedTemplate) return;

    const start = textAreaRef.selectionStart;
    const end = textAreaRef.selectionEnd;
    const currentValue = editedTemplate.templateBody || '';
    const newValue = currentValue.substring(0, start) + variable + currentValue.substring(end);
    
    setEditedTemplate({
      ...editedTemplate,
      templateBody: newValue
    });

    setTimeout(() => {
      textAreaRef.focus();
      const newCursorPos = start + variable.length;
      textAreaRef.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  if (!isMounted) return null;
  if (isLoading) return <LoadingSpinner />;

  return (
    <div className={`
      transition-all duration-300
      ${isExpanded ? 'ml-64' : 'ml-20'}
      pr-8 pl-8
    `}>
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Email Templates</h1>
            <p className="text-sm text-slate-600 mt-1">
              Customize notification templates for repairs and rentals
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors"
          >
            Create Template
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{template.templateName}</h2>
                <p className="text-sm text-slate-600 mt-1">Subject: {template.templateSubject}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedTemplate(template.id);
                  setEditedTemplate(template);
                }}
                className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors"
              >
                Edit Template
              </button>
            </div>
            <div className="bg-slate-50 p-4 rounded-md mb-2">
              <pre className="text-sm text-slate-600 whitespace-pre-wrap">
                {template.templateBody}
              </pre>
            </div>
            <div className="text-xs text-slate-500 mt-2">
              Type: {template.templateType || 'Not specified'}
            </div>
          </div>
        ))}
      </div>

      {selectedTemplate && editedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Edit Template</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Template Name
              </label>
              <input
                type="text"
                value={editedTemplate.templateName}
                onChange={(e) => setEditedTemplate({
                  ...editedTemplate,
                  templateName: e.target.value
                })}
                className="w-full border border-slate-200 rounded-md p-2 text-slate-900"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={editedTemplate.templateSubject}
                onChange={(e) => setEditedTemplate({
                  ...editedTemplate,
                  templateSubject: e.target.value
                })}
                className="w-full border border-slate-200 rounded-md p-2 text-slate-900"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Template
              </label>
              <textarea
                ref={setTextAreaRef}
                value={editedTemplate.templateBody}
                onChange={(e) => setEditedTemplate({
                  ...editedTemplate,
                  templateBody: e.target.value
                })}
                rows={10}
                className="w-full border border-slate-200 rounded-md p-2 font-mono text-sm text-slate-900"
              />
              <div className="text-sm text-slate-700 mt-2 space-y-1">
                <p className="font-medium">Available variables:</p>
                <ul className="grid grid-cols-2 gap-2">
                  {variablesList.map((item) => (
                    <li key={item.var}>
                      <button
                        onClick={() => insertVariableInEdit(item.var)}
                        className="text-left p-2 rounded w-full text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                      >
                        {item.desc}
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-slate-600 italic">
                  Click a variable to insert it at cursor position
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Template Type
              </label>
              <select
                value={editedTemplate.templateType || ''}
                onChange={(e) => setEditedTemplate({
                  ...editedTemplate,
                  templateType: e.target.value
                })}
                className="w-full border border-slate-200 rounded-md p-2 text-slate-900"
                required
              >
                <option value="">Select Template Type...</option>
                {TEMPLATE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
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

      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Create New Template</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Template Name
              </label>
              <input
                type="text"
                value={newTemplate.templateName}
                onChange={(e) => setNewTemplate({
                  ...newTemplate,
                  templateName: e.target.value
                })}
                className="w-full border border-slate-200 rounded-md p-2 text-slate-900"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={newTemplate.templateSubject}
                onChange={(e) => setNewTemplate({
                  ...newTemplate,
                  templateSubject: e.target.value
                })}
                className="w-full border border-slate-200 rounded-md p-2 text-slate-900"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Template Body
              </label>
              <textarea
                ref={setTextAreaRef}
                value={newTemplate.templateBody}
                onChange={(e) => setNewTemplate({
                  ...newTemplate,
                  templateBody: e.target.value
                })}
                rows={10}
                className="w-full border border-slate-200 rounded-md p-2 font-mono text-sm text-slate-900"
              />
              <div className="text-sm text-slate-700 mt-2 space-y-1">
                <p className="font-medium">Available variables:</p>
                <ul className="grid grid-cols-2 gap-2">
                  {variablesList.map((item) => (
                    <li key={item.var}>
                      <button
                        onClick={() => insertVariable(item.var)}
                        className="text-left p-2 rounded w-full text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                      >
                        {item.desc}
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-slate-600 italic">
                  Click a variable to insert it at cursor position
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Template Type
              </label>
              <select
                value={newTemplate.templateType}
                onChange={(e) => setNewTemplate({
                  ...newTemplate,
                  templateType: e.target.value
                })}
                className="w-full border border-slate-200 rounded-md p-2 text-slate-900"
                required
              >
                <option value="">Select Template Type...</option>
                {TEMPLATE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewTemplate({ templateName: '', templateSubject: '', templateBody: '', templateType: '' });
                }}
                className="px-4 py-2 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTemplate}
                className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors"
              >
                Create Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 