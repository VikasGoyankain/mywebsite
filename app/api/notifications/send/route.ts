import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const PUSH_SUBSCRIPTIONS_KEY = 'push_subscriptions';

interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  tag?: string;
}

// POST - Send notification to all subscribers
// Note: This uses the Web Push Protocol. Install web-push: pnpm add web-push
export async function POST(request: NextRequest) {
  try {
    // Verify admin authorization (add your auth check here)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload: NotificationPayload = await request.json();

    if (!payload.title || !payload.body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    // Get all subscriptions
    const subscriptions = await kv.get<any[]>(PUSH_SUBSCRIPTIONS_KEY) || [];

    if (subscriptions.length === 0) {
      return NextResponse.json({ 
        success: true, 
        sent: 0,
        message: 'No subscribers to notify' 
      });
    }

    // Dynamic import of web-push to handle missing module gracefully
    let webpush: any;
    try {
      // @ts-ignore - web-push may not be installed
      webpush = await import('web-push');
      
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
      const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
      
      if (vapidPublicKey && vapidPrivateKey) {
        webpush.setVapidDetails(
          `mailto:${process.env.VAPID_EMAIL || 'contact@vikasgoyanka.in'}`,
          vapidPublicKey,
          vapidPrivateKey
        );
      } else {
        return NextResponse.json(
          { error: 'VAPID keys not configured' },
          { status: 500 }
        );
      }
    } catch (e) {
      return NextResponse.json(
        { error: 'web-push module not installed. Run: pnpm add web-push' },
        { status: 500 }
      );
    }

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || '/blog',
      icon: payload.icon || '/icons/icon-192x192.png',
      tag: payload.tag || `blog-${Date.now()}`,
    });

    // Send notifications in parallel
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(subscription, notificationPayload);
          return { success: true, endpoint: subscription.endpoint };
        } catch (error: any) {
          // Remove invalid subscriptions (410 Gone or 404)
          if (error.statusCode === 410 || error.statusCode === 404) {
            return { 
              success: false, 
              endpoint: subscription.endpoint, 
              remove: true 
            };
          }
          return { 
            success: false, 
            endpoint: subscription.endpoint, 
            error: error.message 
          };
        }
      })
    );

    // Clean up invalid subscriptions
    const endpointsToRemove: string[] = [];
    let successCount = 0;

    for (const result of results) {
      if (result.status === 'fulfilled') {
        if (result.value.success) {
          successCount++;
        } else if (result.value.remove) {
          endpointsToRemove.push(result.value.endpoint);
        }
      }
    }

    if (endpointsToRemove.length > 0) {
      const validSubscriptions = subscriptions.filter(
        (sub) => !endpointsToRemove.includes(sub.endpoint)
      );
      await kv.set(PUSH_SUBSCRIPTIONS_KEY, validSubscriptions);
    }

    return NextResponse.json({ 
      success: true, 
      sent: successCount,
      total: subscriptions.length,
      removed: endpointsToRemove.length,
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}
