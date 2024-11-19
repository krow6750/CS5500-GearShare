import { NextResponse } from 'next/server';
import { booqableService } from '@/lib/booqable/booqableService';
import { airtableService } from '@/lib/airtable/airtableService';
import { emailService } from '@/lib/email/emailService';

export async function GET() {
  const results = {
    booqable: { status: 'not_tested', error: null },
    airtable: { status: 'not_tested', error: null },
    gmail: { status: 'not_tested', error: null }
  };

  // Test Booqable
  try {
    // Try to fetch a simple list or product
    const booqableResponse = await booqableService.getProducts();
    results.booqable = { 
      status: 'success', 
      data: 'Connected successfully' 
    };
  } catch (error) {
    results.booqable = { 
      status: 'error', 
      error: error.message,
      config: {
        apiKey: process.env.BOOQABLE_API_KEY ? 'Set' : 'Missing',
        companySlug: process.env.BOOQABLE_COMPANY_SLUG
      }
    };
  }

  // Test Airtable
  try {
    const airtableResponse = await airtableService.getEquipment();
    results.airtable = { 
      status: 'success', 
      data: 'Connected successfully' 
    };
  } catch (error) {
    results.airtable = { 
      status: 'error', 
      error: error.message,
      config: {
        apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY ? 'Set' : 'Missing',
        baseId: process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID
      }
    };
  }

  // Test Gmail
  try {
    // Just test configuration, don't actually send email
    results.gmail = { 
      status: 'config_check', 
      config: {
        email: process.env.GMAIL_EMAIL ? 'Set' : 'Missing',
        appPassword: process.env.GMAIL_APP_PASSWORD ? 'Set' : 'Missing'
      }
    };
  } catch (error) {
    results.gmail = { 
      status: 'error', 
      error: error.message 
    };
  }

  return NextResponse.json(results);
} 