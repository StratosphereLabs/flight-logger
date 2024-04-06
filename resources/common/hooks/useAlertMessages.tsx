import { NotificationColor } from '@prisma/client';
import toast, { useToasterStore } from 'react-hot-toast/headless';
import { Alert, type AlertColor } from 'stratosphere-ui';
import { NOTIFICATION_STATUS_TO_ICON_MAP } from '../constants';

export interface NotificationOptions {
  persist?: boolean;
  color?: NotificationColor;
  title: string;
  description?: string;
  duration?: number;
  showDefault?: boolean;
  expiration?: Date;
}

export interface UseAlertMessagesResult {
  addAlertMessages: (messages: NotificationOptions[]) => void;
  clearAlertMessages: () => void;
  dismissAlertMessage: (index?: number) => void;
}

export const useAlertMessages = (): UseAlertMessagesResult => {
  const { toasts } = useToasterStore();
  return {
    addAlertMessages: (data: NotificationOptions[]) => {
      data.forEach(notification => {
        console.log(notification);
        const notificationColor = notification.color ?? NotificationColor.INFO;
        const Icon = NOTIFICATION_STATUS_TO_ICON_MAP[notificationColor];
        toast.custom(
          <Alert
            actionButtons={[
              {
                id: 'close',
                'aria-label': 'Close Alert',
                color: 'ghost',
                onClick: () => {
                  toast.dismiss();
                },
                shape: 'circle',
                size: 'xs',
                children: '✕',
              },
            ]}
            title={notification.title}
            description={notification.description ?? undefined}
            icon={Icon}
            color={notificationColor.toLowerCase() as AlertColor}
          />,
          {
            duration: notification.duration ?? 8000,
          },
        );
      });
    },
    clearAlertMessages: () => {
      toast.dismiss();
    },
    dismissAlertMessage: (index?: number) => {
      const id = toasts[index ?? 0]?.id;
      if (id !== undefined) {
        toast.dismiss(id);
      }
    },
  };
};
