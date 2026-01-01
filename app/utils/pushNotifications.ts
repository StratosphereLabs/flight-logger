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

interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Send push notification to a user via Firebase Cloud Messaging
 * Sends to all registered FCM tokens for the user
 */
export async function sendPushNotificationToUser(
  userId: number,
  payload: PushNotificationPayload,
): Promise<{ success: boolean; sentCount: number; failedCount: number }> {
  // Check if Firebase Admin is initialized
  if (admin.apps.length === 0) {
    console.warn(
      '[PushNotifications] Firebase Admin not initialized, skipping push notification',
    );
    return { success: false, sentCount: 0, failedCount: 0 };
  }

  // Check if user has push notifications enabled
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pushNotifications: true },
  });

  if (user === null || !user.pushNotifications) {
    return { success: false, sentCount: 0, failedCount: 0 };
  }

  // Get user's FCM tokens
  const fcmTokens = await prisma.fcmToken.findMany({
    where: { userId },
    select: { id: true, token: true },
  });

  if (fcmTokens.length === 0) {
    return { success: false, sentCount: 0, failedCount: 0 };
  }

  const tokens = fcmTokens.map(t => t.token);

  try {
    // Send multicast message to all user's devices
    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data,
      webpush: {
        notification: {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        },
        fcmOptions: {
          link: '/',
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);

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
): Promise<void> {
  if (importedCount === 0 && failedCount === 0) {
    return; // Nothing to notify about
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

  await sendPushNotificationToUser(userId, {
    title,
    body,
    data: {
      type: 'calendar_sync',
      calendarName,
      importedCount: String(importedCount),
      failedCount: String(failedCount),
    },
  });
}
