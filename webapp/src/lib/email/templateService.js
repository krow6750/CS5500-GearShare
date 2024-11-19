import { firebaseDB } from '@/lib/firebase/db';
import { defaultTemplates } from './templates';

const COLLECTION = 'email_templates';

const templates = {
  repair_status: {
    subject: 'Repair Status Update #{{repair_ticket_id}}',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Repair Status Update</h1>
        <p>Your repair ticket has been updated to: <strong>{{status}}</strong></p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
          <h2 style="margin-top: 0;">Repair Details:</h2>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Ticket ID:</strong> {{repair_ticket_id}}</li>
            <li><strong>Status:</strong> {{status}}</li>
            <li><strong>Equipment:</strong> {{equipment_type}}</li>
            <li><strong>Notes:</strong> {{notes}}</li>
          </ul>
        </div>
      </div>
    `
  },
  repair_completion: {
    subject: 'Repair Completed #{{repair_ticket_id}}',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Repair Completed</h1>
        <p>Good news! Your repair ticket has been completed.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
          <h2 style="margin-top: 0;">Repair Details:</h2>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Ticket ID:</strong> {{repair_ticket_id}}</li>
            <li><strong>Equipment:</strong> {{equipment_type}}</li>
            <li><strong>Completion Date:</strong> {{completionDate}}</li>
            <li><strong>Notes:</strong> {{notes}}</li>
          </ul>
        </div>
        <p>If you have any questions, please contact us at {{supportEmail}}</p>
      </div>
    `
  }
};

export const templateService = {
  async getTemplate(templateId) {
    try {
      // Try to get custom template from Firebase
      const customTemplate = await firebaseDB.query(COLLECTION, {
        where: ['id', '==', templateId]
      });

      if (customTemplate.length > 0) {
        return customTemplate[0];
      }

      // Fall back to default template
      return this.getDefaultTemplate(templateId);
    } catch (error) {
      console.error('Error getting template:', error);
      return this.getDefaultTemplate(templateId);
    }
  },

  getDefaultTemplate(templateId) {
    // Navigate the defaultTemplates object to find the template
    const [category, type] = templateId.split('_');
    return defaultTemplates[category]?.[type] || null;
  },

  async updateTemplate(templateId, updates) {
    try {
      const template = await this.getTemplate(templateId);
      const updatedTemplate = {
        ...template,
        ...updates,
        lastUpdated: new Date().toISOString()
      };

      await firebaseDB.set(COLLECTION, templateId, updatedTemplate);
      return updatedTemplate;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  },

  async resetTemplate(templateId) {
    try {
      const defaultTemplate = this.getDefaultTemplate(templateId);
      await firebaseDB.delete(COLLECTION, templateId);
      return defaultTemplate;
    } catch (error) {
      console.error('Error resetting template:', error);
      throw error;
    }
  },

  getTemplate(templateId) {
    const template = templates[templateId];
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }
    return template;
  },

  getAllTemplates() {
    return templates;
  },

  updateTemplate(templateId, newTemplate) {
    if (!templates[templateId]) {
      throw new Error(`Template not found: ${templateId}`);
    }
    templates[templateId] = newTemplate;
    return templates[templateId];
  }
}; 