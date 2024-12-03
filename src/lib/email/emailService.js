import { emailTemplateService } from '../airtable/emailTemplateServices';
import booqableService from '../booqable/booqableService';

export const emailServices = {
  async sendEmail({
    templateName,
    recipients,
    firstName,
    lastName,
    finalPrice,
    repairId,
    itemType,
    paymentType,
    status,
    notes
  }) {
    try {

      if (!templateName || !recipients) {
        throw new Error('Template name and recipients are required');
      }

      const template = await emailTemplateService.fetchTemplateByName(templateName);
      if (!template) {
        throw new Error(`Email template '${templateName}' not found`);
      }


      console.log('Template found:', {
        id: template.id,
        name: templateName,
        subject: template.subject
      });

      const replacements = {
        '{{firstName}}': firstName || '',
        '{{lastName}}': lastName || '',
        '{{finalPrice}}': finalPrice ? `$${finalPrice}` : '',
        '{{repairId}}': repairId || '',
        '{{itemType}}': itemType || '',
        '{{paymentType}}': paymentType || '',
        '{{status}}': status || '',
        '{{notes}}': notes || ''
      };

      let subject = template.subject;
      let body = template.body;


      body = body.replace(/\n/g, '<br>');

      Object.entries(replacements).forEach(([placeholder, value]) => {
        const regex = new RegExp(placeholder, 'g');
        subject = subject.replace(regex, value);
        body = body.replace(regex, value);
      });


      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recipients)) {
        throw new Error(`Invalid email format: ${recipients}`);
      }

      console.log('Sending email with payload:', {
        to: recipients,
        subject,
        templateId: template.id
      });

      const response = await booqableService.sendEmailNotification(
        recipients,
        subject,
        body,
        template.id,
        null,
        null,
        []
      );

      console.log('Email sent successfully:', response);
      return response;

    } catch (error) {

      console.error('Email sending failed:', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        templateName,
        recipients
      });
      throw error;
    }
  }
};

export default emailServices;