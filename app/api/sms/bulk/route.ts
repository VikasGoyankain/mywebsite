import { NextRequest, NextResponse } from 'next/server';
import { smsService } from '@/lib/services/sms-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate required parameters
    const { phoneNumbers, message } = body;
    
    if (!phoneNumbers || !Array.isArray(phoneNumbers) || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: phoneNumbers (array), message' },
        { status: 400 }
      );
    }
    
    // Send bulk SMS using our service
    const result = await smsService.sendBulkSMS(phoneNumbers, message, body.senderId);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: true, data: result.data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in bulk SMS API route:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send bulk SMS' },
      { status: 500 }
    );
  }
} 