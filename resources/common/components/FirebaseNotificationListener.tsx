import { onMessage } from 'firebase/messaging';
import { useEffect } from 'react';
import { useAlertMessages } from 'stratosphere-ui';

import { messaging } from '../../utils/firebase';

/**
 * Component that listens for Firebase Cloud Messaging notifications
 * and displays them as in-app alerts using the alert messages system.
 *
 * For foreground notifications, displays an in-app toast alert.
 * Background notifications are handled by the service worker and
 * will navigate to the appropriate page when clicked.
 */
export const FirebaseNotificationListener = (): null => {
  const { addAlertMessages } = useAlertMessages();

  useEffect(() => {
    if (messaging === undefined) {
      return;
    }

    // Listen for foreground messages
    const unsubscribe = onMessage(messaging, payload => {
      console.log('[Firebase] Received foreground message:', payload);

      const notification = payload.notification;
      if (notification !== undefined) {
        // Determine alert color based on notification data
        let color: 'success' | 'warning' | 'error' | 'info' = 'info';
        const data = payload.data;

        if (data?.type === 'calendar_sync_start') {
          // Import starting notification - use info color
          color = 'info';
        } else if (data?.type === 'calendar_sync') {
          // Import complete notification
          const importedCount = parseInt(data.importedCount ?? '0', 10);
          const failedCount = parseInt(data.failedCount ?? '0', 10);

          if (importedCount > 0 && failedCount === 0) {
            color = 'success';
          } else if (failedCount > 0) {
            color = 'warning';
          }
        }

        addAlertMessages([
          {
            color,
            title: notification.title ?? 'Notification',
            description: notification.body,
          },
        ]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [addAlertMessages]);

  return null;
};
