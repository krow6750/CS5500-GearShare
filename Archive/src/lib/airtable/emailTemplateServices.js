import 'dotenv/config';
import Airtable from 'airtable';

const AIRTABLE_API_KEY = process.env.NEXT_PUBLIC_AIRTABLE_TAMPLATE_API_KEY;
const AIRTABLE_BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_TAMPLATE_BASE_ID;
const TABLE_ID = 'tblq9pvXs7UUttXl7';

if (!AIRTABLE_API_KEY) {
  throw new Error('AIRTABLE_API_KEY is not set in the environment variables');
}

if (!AIRTABLE_BASE_ID) {
  throw new Error('AIRTABLE_BASE_ID is not set in the environment variables');
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

export const emailTemplateService = {
  createEmailTemplate: async (templateName, templateSubject, templateBody, templateType) => {
    try {
      const createdRecord = await base(TABLE_ID).create({
        'TemplateName': templateName,
        'TemplateSubject': templateSubject,
        'TemplateBody': templateBody,
        'Template Type': templateType
      });

      console.log('Created email template:', createdRecord.id);
      return createdRecord;
    } catch (error) {
      console.error('Error creating email template:', error);
      throw error;
    }
  },

  fetchEmailTemplates: async () => {
    try {
      const records = await base(TABLE_ID).select().all();
      return records.map(record => ({
        id: record.id,
        templateName: record.get('TemplateName'),
        templateSubject: record.get('TemplateSubject'),
        templateBody: record.get('TemplateBody'),
        templateType: record.get('Template Type'),
        autonumber: record.get('Autonumber')
      }));
    } catch (error) {
      console.error('Error fetching email templates:', error);
      throw error;
    }
  },

  deleteEmailTemplate: async (templateName) => {
    try {
      const records = await base(TABLE_ID).select({
        filterByFormula: `{TemplateName} = '${templateName}'`
      }).all();

      if (records.length === 0) {
        throw new Error(`No template found with name: ${templateName}`);
      }

      const deletedRecord = await base(TABLE_ID).destroy(records[0].id);
      console.log('Deleted email template:', deletedRecord.id);
      return deletedRecord;
    } catch (error) {
      console.error('Error deleting email template:', error);
      throw error;
    }
  },

  updateTemplate: async (templateId, updatedTemplate) => {
    try {
      const updatedRecord = await base(TABLE_ID).update(templateId, {
        'TemplateName': updatedTemplate.templateName,
        'TemplateSubject': updatedTemplate.templateSubject,
        'TemplateBody': updatedTemplate.templateBody,
        'Template Type': updatedTemplate.templateType
      });

      console.log('Updated email template:', updatedRecord.id);
      return updatedRecord;
    } catch (error) {
      console.error('Error updating email template:', error);
      throw error;
    }
  },

  async fetchTemplateByName(templateName) {
    try {
      const records = await base(TABLE_ID).select({
        filterByFormula: `{TemplateName} = '${templateName}'`
      }).all();

      if (records.length === 0) {
        return null;
      }

      const record = records[0];
      return {
        id: record.id,
        templateName: record.get('TemplateName'),
        subject: record.get('TemplateSubject'),
        body: record.get('TemplateBody'),
        templateType: record.get('Template Type')
      };
    } catch (error) {
      console.error('Error fetching template by name:', error);
      throw error;
    }
  }
};

export default emailTemplateService;