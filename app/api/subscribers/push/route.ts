import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const PUSH_SUBSCRIPTIONS_KEY = 'push_subscriptions';

// POST - Subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscription } = body;

    console.log('Received push subscription request:', JSON.stringify(subscription, null, 2));

    if (!subscription || !subscription.endpoint) {
      console.error('Invalid subscription - missing endpoint:', subscription);
      return NextResponse.json(
        { error: 'Invalid subscription object - endpoint required' },
        { status: 400 }
      );
    }

    // Validate subscription has required fields
    if (!subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
      console.error('Invalid subscription - missing keys:', subscription);
      return NextResponse.json(
        { error: 'Invalid subscription object - keys required' },
        { status: 400 }
      );
    }

    // Get existing subscriptions
    const existingSubscriptions = await kv.get<any[]>(PUSH_SUBSCRIPTIONS_KEY) || [];
    console.log('Existing subscriptions count:', existingSubscriptions.length);

    // Check if already subscribed
    const alreadyExists = existingSubscriptions.some(
      (sub) => sub.endpoint === subscription.endpoint
    );

    if (!alreadyExists) {
      // Add new subscription with all required fields
      const newSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        expirationTime: subscription.expirationTime || null,
        createdAt: new Date().toISOString(),
        userAgent: request.headers.get('user-agent') || 'unknown',
      };

      existingSubscriptions.push(newSubscription);
      await kv.set(PUSH_SUBSCRIPTIONS_KEY, existingSubscriptions);
      console.log('New subscription saved. Total count:', existingSubscriptions.length);
    } else {
      console.log('Subscription already exists for endpoint');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Subscribed to push notifications',
      totalSubscribers: existingSubscriptions.length
    });
  } catch (error) {
    console.error('Error subscribing to push:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe: ' + (error instanceof Error ? error.message : 'Unknown error') },
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
    
    console.log('Fetching push subscriptions. Count:', subscriptions.length);
    
    return NextResponse.json({ 
      count: subscriptions.length,
      subscriptions: subscriptions.map(sub => ({
        endpoint: sub.endpoint?.substring(0, 50) + '...',
        createdAt: sub.createdAt,
        userAgent: sub.userAgent?.substring(0, 50),
      }))
    });
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to get subscriptions', count: 0 },
      { status: 500 }
    );
  }
}
