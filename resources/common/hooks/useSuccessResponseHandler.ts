import { NotificationColor } from '@prisma/client';
import { useAlertMessages } from './useAlertMessages';

export const useSuccessResponseHandler = (): ((message: string) => void) => {
  const { addAlertMessages } = useAlertMessages();
  return message => {
    addAlertMessages([
      {
        color: NotificationColor.SUCCESS,
        title: message,
      },
    ]);
  };
};
