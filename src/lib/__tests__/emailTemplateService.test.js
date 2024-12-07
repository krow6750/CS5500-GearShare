import { emailTemplateService } from '../airtable/emailTemplateServices';
import 'dotenv/config';

describe('emailTemplateService', () => {
  test('createEmailTemplate', async () => {
    const templateName = 'Test Template';
    const templateSubject = 'Test Subject';
    const templateBody = 'Test Body';
    const templateType = 'Test Type';

    const result = await emailTemplateService.createEmailTemplate(templateName, templateSubject, templateBody, templateType);
    expect(result).toBeTruthy();
    expect(result.id).toBeTruthy();
    console.log(`Created email template with ID: ${result.id}`);
  });

  test('fetchEmailTemplates', async () => {
    const result = await emailTemplateService.fetchEmailTemplates();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    console.log(`Fetched ${result.length} email templates`);
  });

  test('updateTemplate', async () => {
    const templates = await emailTemplateService.fetchEmailTemplates();
    const templateToUpdate = templates[0];
    const updatedTemplate = {
      ...templateToUpdate,
      templateSubject: 'Updated Subject',
      templateBody: 'Updated Body'
    };

    const result = await emailTemplateService.updateTemplate(templateToUpdate.id, updatedTemplate);
    expect(result).toBeTruthy();
    expect(result.id).toBe(templateToUpdate.id);
    console.log(`Updated email template: ${result.id}`);
  });

  test('fetchTemplateByName', async () => {
    const templateName = 'Test Template';
    const result = await emailTemplateService.fetchTemplateByName(templateName);
    expect(result).toBeTruthy();
    expect(result.templateName).toBe(templateName);
    console.log(`Fetched template by name: ${result.templateName}`);
  });

});