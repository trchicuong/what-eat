/**
 * Netlify Scheduled Function: Send meal reminders
 * (Runs at breakfast (7AM VN), lunch (12PM VN), dinner 6PM VN)
 * Configure in netlify.toml to run at: 0 0,5,11 * * * (UTC)
 */

import webpush from 'web-push';
import { getStore } from '@netlify/blobs';

// VAPID configuration from environment variables
const VAPID_PUBLIC_KEY = process.env.VITE_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VITE_VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VITE_VAPID_SUBJECT || 'mailto:homnayangi@example.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export async function handler(event) {
  // Validate Netlify Blobs credentials
  if (!process.env.NETLIFY_SITE_ID || !process.env.NETLIFY_BLOBS_TOKEN) {
    console.error('❌ Netlify Blobs credentials not configured');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error' }),
    };
  }
  console.log('🔔 Starting meal reminder function...');

  // Check VAPID keys
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.error('❌ VAPID keys not configured');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'VAPID keys not configured' }),
    };
  }

  // Determine meal type based on Vietnam time (UTC+7)
  const now = new Date();
  const vnHour = (now.getUTCHours() + 7) % 24;

  let mealType = '';
  if (vnHour >= 6 && vnHour < 10) mealType = 'breakfast';
  else if (vnHour >= 11 && vnHour < 14) mealType = 'lunch';
  else if (vnHour >= 17 && vnHour < 20) mealType = 'dinner';

  if (!mealType) {
    console.log(`⏰ Not a meal time. Current VN hour: ${vnHour}`);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Not a meal time', vnHour }),
    };
  }

  console.log(`🍽️ Meal type: ${mealType} (VN hour: ${vnHour})`);

  try {
    // Load subscriptions from Netlify Blobs
    const store = getStore({
      name: 'push-subscriptions',
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_BLOBS_TOKEN,
    });
    const { blobs } = await store.list();

    console.log(`📦 Found ${blobs.length} subscriptions`);

    // Meal reminder messages
    const messages = {
      breakfast: {
        title: '🌅 Bữa sáng đến rồi!',
        body: 'Hôm nay ăn gì nhỉ? Mở app để xem gợi ý!',
        badge: '/images/icon-192x192.png',
        icon: '/images/icon-192x192.png',
        tag: 'meal-reminder',
        requireInteraction: false,
      },
      lunch: {
        title: '☀️ Bữa trưa đến rồi!',
        body: 'Đã đến giờ ăn trưa! Chọn món ngay nào!',
        badge: '/images/icon-192x192.png',
        icon: '/images/icon-192x192.png',
        tag: 'meal-reminder',
        requireInteraction: false,
      },
      dinner: {
        title: '🌙 Bữa tối đến rồi!',
        body: 'Đừng quên bữa tối nha! Xem gợi ý ngay!',
        badge: '/images/icon-192x192.png',
        icon: '/images/icon-192x192.png',
        tag: 'meal-reminder',
        requireInteraction: false,
      },
    };

    const payload = JSON.stringify(messages[mealType]);
    let sent = 0;
    let failed = 0;

    // Send notifications to all matching subscriptions
    for (const blob of blobs) {
      try {
        const data = JSON.parse(await store.get(blob.key, { type: 'text' }));
        const { subscription, preferences } = data;

        // Check if user wants this meal reminder
        if (!preferences?.enabled || !preferences[mealType]) {
          console.log(`⏭️ Skipping ${blob.key} - preference disabled`);
          continue;
        }

        // Send push notification
        await webpush.sendNotification(subscription, payload);
        sent++;
        console.log(`✅ Sent to ${blob.key}`);
      } catch (error) {
        failed++;
        console.error(`❌ Failed to send to ${blob.key}:`, error.message);

        // If subscription expired (410 Gone), delete it
        if (error.statusCode === 410) {
          console.log(`🗑️ Deleting expired subscription: ${blob.key}`);
          await store.delete(blob.key);
        }
      }
    }

    const result = {
      mealType,
      vnHour,
      totalSubscriptions: blobs.length,
      sent,
      failed,
      timestamp: new Date().toISOString(),
    };

    console.log('📊 Result:', result);

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('💥 Error in send-reminders:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to send reminders',
        message: error.message,
      }),
    };
  }
}
