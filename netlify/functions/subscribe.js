/**
 * Netlify Function: Subscribe to Push Notifications
 * Stores subscription in Netlify Blobs for scheduled reminders
 */

import { getStore } from '@netlify/blobs';

export async function handler(event) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Validate Netlify Blobs credentials
  if (!process.env.NETLIFY_SITE_ID || !process.env.NETLIFY_BLOBS_TOKEN) {
    console.error('❌ Netlify Blobs credentials not configured');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server configuration error' }),
    };
  }

  try {
    const { subscription, preferences } = JSON.parse(event.body || '{}');

    if (!subscription || !subscription.endpoint) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid subscription data' }),
      };
    }

    // Store subscription in Netlify Blobs
    const store = getStore({
      name: 'push-subscriptions',
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_BLOBS_TOKEN,
    });

    // Create unique ID from endpoint
    const subscriptionId = Buffer.from(subscription.endpoint)
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 50);

    // Rate limit: block updates more frequent than 30s per endpoint
    const existingRaw = await store.get(subscriptionId, { type: 'text' });
    if (existingRaw) {
      try {
        const existing = JSON.parse(existingRaw);
        const lastUpdate = existing.updatedAt ? Date.parse(existing.updatedAt) : 0;
        const timeSinceLastUpdate = Date.now() - lastUpdate;

        if (timeSinceLastUpdate < 30000) {
          const secondsLeft = Math.ceil((30000 - timeSinceLastUpdate) / 1000);
          return {
            statusCode: 429,
            headers,
            body: JSON.stringify({
              error: `Too many requests. Please wait ${secondsLeft} seconds.`,
              secondsLeft,
            }),
          };
        }
      } catch (parseError) {
        console.warn('Failed to parse existing subscription:', parseError);
        // Continue with update if can't parse existing data
      }
    }

    const nowIso = new Date().toISOString();

    // Safely get createdAt from existing subscription
    let createdAt = nowIso;
    if (existingRaw) {
      try {
        const existing = JSON.parse(existingRaw);
        createdAt = existing.createdAt || nowIso;
      } catch {
        // Use current time if parse fails
      }
    }

    const data = {
      subscription,
      preferences: preferences || {
        enabled: true,
        breakfast: true,
        lunch: true,
        dinner: true,
        timezone: 'Asia/Ho_Chi_Minh',
      },
      createdAt,
      updatedAt: nowIso,
    };

    await store.set(subscriptionId, JSON.stringify(data));

    console.log('✅ Subscription saved:', subscriptionId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Đã lưu đăng ký thông báo thành công',
        subscriptionId,
      }),
    };
  } catch (error) {
    console.error('❌ Subscribe error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to save subscription',
        message: error.message,
      }),
    };
  }
}
