import { useCallback } from 'react';
import { useAlertMessages } from 'stratosphere-ui';

export const useSuccessResponseHandler = (): ((message: string) => void) => {
  const { addAlertMessages } = useAlertMessages();
  return useCallback(
    message => {
      addAlertMessages([
        {
          color: 'success',
          title: message,
        },
      ]);
    },
    [addAlertMessages],
  );
};
