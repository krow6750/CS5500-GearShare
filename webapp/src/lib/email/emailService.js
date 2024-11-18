import dotenv from 'dotenv';
import { templateService } from './templateService';
import { logActivity } from '@/lib/utils/activityLogger';

// Ensure environment variables are loaded
dotenv.config();

// Update environment variable names
const GMAIL_EMAIL = process.env.NEXT_PUBLIC_GMAIL_EMAIL;
const GMAIL_APP_PASSWORD = process.env.NEXT_PUBLIC_GMAIL_APP_PASSWORD;

// Verify required environment variables
const requiredEnvVars = ['NEXT_PUBLIC_GMAIL_EMAIL', 'NEXT_PUBLIC_GMAIL_APP_PASSWORD'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.warn(`Missing environment variable: ${varName}`);
  }
});

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const emailService = {
  async sendEmail(to, subject, html) {
    try {
      console.log('Sending email with:', { to, subject });
      
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to,
          subject,
          html
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Email API error:', errorData);
        throw new Error(`Email API error: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      console.log('Email sent successfully:', result);
      
      await logActivity({
        action_type: 'email',
        collection: 'system',
        description: 'Email sent successfully',
        details: {
          to,
          subject,
          messageId: result.messageId
        }
      });

      return result;
    } catch (error) {
      console.error('Failed to send email:', error);
      // Log the failure but don't throw
      await logActivity({
        action_type: 'email',
        collection: 'system',
        description: 'Failed to send email',
        details: {
          error: error.message,
          to,
          subject
        }
      });
      // Return failure object instead of throwing
      return {
        success: false,
        error: error.message
      };
    }
  },

  async sendTemplatedEmail(to, templateId, data) {
    try {
      const template = templateService.getTemplate(templateId);
      
      // Replace variables in subject
      const subject = template.subject.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data[key] || match;
      });

      // Replace variables in template
      const html = template.template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data[key] || match;
      });

      return this.sendEmail(to, subject, html);
    } catch (error) {
      console.error('Failed to send templated email:', error);
      throw error;
    }
  },

  async sendRepairUpdate(repair, userEmail) {
    const templateData = {
      repair_ticket_id: repair.repair_ticket_id,
      status: repair.status,
      equipment_type: repair.equipment_type,
      notes: repair.notes || 'No additional notes',
      completionDate: repair.status === 'completed' ? new Date().toLocaleDateString() : '',
      supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@gearshare.com'
    };

    return this.sendTemplatedEmail(
      userEmail,
      repair.status === 'completed' ? 'repair_completion' : 'repair_status',
      templateData
    );
  }
}; 