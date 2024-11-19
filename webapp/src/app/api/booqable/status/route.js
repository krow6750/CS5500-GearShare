import { NextResponse } from 'next/server';
import { booqableService } from '@/lib/booqable/booqableService';

export async function GET() {
  try {
    // Test the connection
    const testResponse = await booqableService.makeRequest('/products', 'GET');
    return NextResponse.json({
      success: true,
      configured: true,
      baseUrl: booqableService.baseUrl,
      hasApiKey: !!booqableService.apiKey,
      testResponse
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      configured: false,
      error: error.message,
      baseUrl: booqableService.baseUrl,
      hasApiKey: !!booqableService.apiKey
    });
  }
}