import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const PUSH_SUBSCRIPTIONS_KEY = 'push_subscriptions';

// POST - Subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    const { subscription } = await request.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription object' },
        { status: 400 }
      );
    }

    // Get existing subscriptions
    const existingSubscriptions = await kv.get<any[]>(PUSH_SUBSCRIPTIONS_KEY) || [];

    // Check if already subscribed
    const alreadyExists = existingSubscriptions.some(
      (sub) => sub.endpoint === subscription.endpoint
    );

    if (!alreadyExists) {
      // Add new subscription
      existingSubscriptions.push({
        ...subscription,
        createdAt: new Date().toISOString(),
      });

      await kv.set(PUSH_SUBSCRIPTIONS_KEY, existingSubscriptions);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Subscribed to push notifications' 
    });
  } catch (error) {
    console.error('Error subscribing to push:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}

// DELETE - Unsubscribe from push notifications
export async function DELETE(request: NextRequest) {
  try {
    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint required' },
        { status: 400 }
      );
    }

    const existingSubscriptions = await kv.get<any[]>(PUSH_SUBSCRIPTIONS_KEY) || [];
    
    const filteredSubscriptions = existingSubscriptions.filter(
      (sub) => sub.endpoint !== endpoint
    );

    await kv.set(PUSH_SUBSCRIPTIONS_KEY, filteredSubscriptions);

    return NextResponse.json({ 
      success: true, 
      message: 'Unsubscribed from push notifications' 
    });
  } catch (error) {
    console.error('Error unsubscribing from push:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}

// GET - Get subscription count (admin use)
export async function GET() {
  try {
    const subscriptions = await kv.get<any[]>(PUSH_SUBSCRIPTIONS_KEY) || [];
    
    return NextResponse.json({ 
      count: subscriptions.length 
    });
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to get subscriptions' },
      { status: 500 }
    );
  }
}
