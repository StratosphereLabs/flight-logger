import admin, { type ServiceAccount } from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

import { prisma } from '../db';

// Initialize Firebase Admin SDK (only once)
if (admin.apps.length === 0) {
  try {
    // Try to load service account from file first, then fall back to env var
    let serviceAccount: ServiceAccount | undefined;

    // Try loading from file
    try {
      const serviceAccountPath = join(process.cwd(), 'firebase-secret.json');
      const fileContent = readFileSync(serviceAccountPath, 'utf-8');
      serviceAccount = JSON.parse(fileContent) as ServiceAccount;
    } catch {
      // File not found, try environment variable
      const envServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (envServiceAccount !== undefined && envServiceAccount !== '') {
        serviceAccount = JSON.parse(envServiceAccount) as ServiceAccount;
      }
    }

    if (serviceAccount !== undefined) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log(
        '[PushNotifications] Firebase Admin initialized successfully',
      );
    } else {
      console.warn(
        '[PushNotifications] No Firebase service account found - push notifications disabled',
      );
    }
  } catch (error) {
    console.error(
      '[PushNotifications] Failed to initialize Firebase Admin:',
      error,
    );
  }
}

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour window
const RATE_LIMIT_MAX_NOTIFICATIONS = 10; // Max 10 notifications per hour per user

// In-memory rate limit store (in production, use Redis)
// Map<userId, timestamp[]>
const rateLimitStore = new Map<number, number[]>();

/**
 * Check if a user is rate limited for push notifications
 * Returns true if rate limited, false if allowed
 */
function isRateLimited(userId: number): boolean {
  const now = Date.now();
  const timestamps = rateLimitStore.get(userId) ?? [];

  // Filter to only keep timestamps within the window
  const recentTimestamps = timestamps.filter(
    ts => now - ts < RATE_LIMIT_WINDOW_MS,
  );

  // Update the store with filtered timestamps
  rateLimitStore.set(userId, recentTimestamps);

  return recentTimestamps.length >= RATE_LIMIT_MAX_NOTIFICATIONS;
}

/**
 * Record a notification send for rate limiting
 */
function recordNotificationSend(userId: number): void {
  const timestamps = rateLimitStore.get(userId) ?? [];
  timestamps.push(Date.now());
  rateLimitStore.set(userId, timestamps);
}

/**
 * Clean up old rate limit entries (call periodically to prevent memory leaks)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [userId, timestamps] of rateLimitStore.entries()) {
    const recentTimestamps = timestamps.filter(
      ts => now - ts < RATE_LIMIT_WINDOW_MS,
    );
    if (recentTimestamps.length === 0) {
      rateLimitStore.delete(userId);
    } else {
      rateLimitStore.set(userId, recentTimestamps);
    }
  }
}

interface PushNotificationPayload {
  title: string;
  body: string;
  clickUrl?: string;
  data?: Record<string, string>;
}

/**
 * Send push notification to a user via Firebase Cloud Messaging
 * Sends to all registered FCM tokens for the user
 *
 * Rate limited to prevent notification spam (max 10 per hour per user)
 */
export async function sendPushNotificationToUser(
  userId: number,
  payload: PushNotificationPayload,
): Promise<{
  success: boolean;
  sentCount: number;
  failedCount: number;
  rateLimited?: boolean;
}> {
  // Check if Firebase Admin is initialized
  if (admin.apps.length === 0) {
    console.warn(
      '[PushNotifications] Firebase Admin not initialized, skipping push notification',
    );
    return { success: false, sentCount: 0, failedCount: 0 };
  }

  // Check rate limit
  if (isRateLimited(userId)) {
    console.warn(
      `[PushNotifications] Rate limited for user ${userId}, skipping notification`,
    );
    return { success: false, sentCount: 0, failedCount: 0, rateLimited: true };
  }

  // Check if user has push notifications enabled
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pushNotifications: true },
  });

  if (user === null) {
    console.warn(
      `[PushNotifications] User ${userId} not found, skipping notification`,
    );
    return { success: false, sentCount: 0, failedCount: 0 };
  }

  if (!user.pushNotifications) {
    console.log(
      `[PushNotifications] User ${userId} has push notifications disabled`,
    );
    return { success: false, sentCount: 0, failedCount: 0 };
  }

  // Get user's FCM tokens
  const fcmTokens = await prisma.fcmToken.findMany({
    where: { userId },
    select: { id: true, token: true },
  });

  if (fcmTokens.length === 0) {
    console.warn(
      `[PushNotifications] User ${userId} has no registered FCM tokens`,
    );
    return { success: false, sentCount: 0, failedCount: 0 };
  }

  console.log(
    `[PushNotifications] Sending notification to user ${userId} with ${fcmTokens.length} token(s)`,
  );

  const tokens = fcmTokens.map(t => t.token);

  try {
    // Build data object with click URL
    const notificationData: Record<string, string> = {
      ...payload.data,
      clickUrl: payload.clickUrl ?? '/',
    };

    // Send multicast message to all user's devices
    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: notificationData,
      webpush: {
        notification: {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        },
        fcmOptions: {
          link: payload.clickUrl ?? '/',
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    // Record the notification send for rate limiting
    recordNotificationSend(userId);

    // Clean up invalid tokens
    const tokensToRemove: string[] = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const error = resp.error;
        // Remove invalid or unregistered tokens
        if (
          error?.code === 'messaging/invalid-registration-token' ||
          error?.code === 'messaging/registration-token-not-registered'
        ) {
          tokensToRemove.push(fcmTokens[idx].id);
        }
      }
    });

    // Delete invalid tokens
    if (tokensToRemove.length > 0) {
      await prisma.fcmToken.deleteMany({
        where: { id: { in: tokensToRemove } },
      });
      console.log(
        `[PushNotifications] Removed ${tokensToRemove.length} invalid FCM tokens`,
      );
    }

    console.log(
      `[PushNotifications] Sent to user ${userId}: ${response.successCount} success, ${response.failureCount} failed`,
    );

    return {
      success: response.successCount > 0,
      sentCount: response.successCount,
      failedCount: response.failureCount,
    };
  } catch (error) {
    console.error(
      '[PushNotifications] Error sending push notification:',
      error,
    );
    return { success: false, sentCount: 0, failedCount: 0 };
  }
}

/**
 * Send calendar sync completion notification
 */
export async function sendCalendarSyncNotification(
  userId: number,
  calendarName: string,
  importedCount: number,
  failedCount: number,
): Promise<{
  success: boolean;
  sentCount: number;
  failedCount: number;
  rateLimited?: boolean;
}> {
  if (importedCount === 0 && failedCount === 0) {
    console.log(
      `[PushNotifications] No flights to notify about for calendar "${calendarName}"`,
    );
    return { success: false, sentCount: 0, failedCount: 0 }; // Nothing to notify about
  }

  let title: string;
  let body: string;

  if (importedCount > 0 && failedCount === 0) {
    const flightWord = importedCount === 1 ? 'flight' : 'flights';
    title = 'Flights imported';
    body = `${importedCount} ${flightWord} imported from "${calendarName}"`;
  } else if (importedCount === 0 && failedCount > 0) {
    const flightWord = failedCount === 1 ? 'flight' : 'flights';
    title = 'Flights need review';
    body = `${failedCount} ${flightWord} from "${calendarName}" need manual review`;
  } else {
    const importedWord = importedCount === 1 ? 'flight' : 'flights';
    const failedWord = failedCount === 1 ? 'flight' : 'flights';
    title = 'Calendar sync complete';
    body = `${importedCount} ${importedWord} imported, ${failedWord} need review from "${calendarName}"`;
  }

  console.log(
    `[PushNotifications] Attempting to send calendar sync notification: "${title}" - "${body}"`,
  );

  return await sendPushNotificationToUser(userId, {
    title,
    body,
    clickUrl: '/account/calendar-sync',
    data: {
      type: 'calendar_sync',
      calendarName,
      importedCount: String(importedCount),
      failedCount: String(failedCount),
    },
  });
}

/**
 * Send notification when flights are detected and import is starting
 */
export async function sendCalendarSyncStartNotification(
  userId: number,
  calendarName: string,
  flightCount: number,
): Promise<{
  success: boolean;
  sentCount: number;
  failedCount: number;
  rateLimited?: boolean;
}> {
  if (flightCount === 0) {
    return { success: false, sentCount: 0, failedCount: 0 };
  }

  const flightWord = flightCount === 1 ? 'flight' : 'flights';
  const title = 'Importing flights';
  const body = `Found ${flightCount} ${flightWord} in "${calendarName}". Importing now...`;

  console.log(
    `[PushNotifications] Attempting to send calendar sync start notification: "${title}" - "${body}"`,
  );

  return await sendPushNotificationToUser(userId, {
    title,
    body,
    clickUrl: '/account/calendar-sync',
    data: {
      type: 'calendar_sync_start',
      calendarName,
      flightCount: String(flightCount),
    },
  });
}
