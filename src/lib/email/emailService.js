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
      const template = await emailTemplateService.fetchTemplateByName(templateName);
      if (!template) {
        throw new Error(`Email template '${templateName}' not found`);
      }

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

      Object.entries(replacements).forEach(([placeholder, value]) => {
        const regex = new RegExp(placeholder, 'g');
        subject = subject.replace(regex, value);
        body = body.replace(regex, value);
      });

      await booqableService.sendEmailNotification(
        recipients,
        subject,
        body,
        template.id,
        null,
        null,
        []
      );

      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
};

export default emailServices;