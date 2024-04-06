import { NotificationColor } from '@prisma/client';
import { type AxiosResponse } from 'axios';
import { useCallback } from 'react';
import { type ErrorResponse } from '../types';
import { type NotificationOptions, useAlertMessages } from './useAlertMessages';

export const useErrorResponseHandler = (
  defaultMessage?: NotificationOptions,
): ((response?: AxiosResponse<ErrorResponse>) => void) => {
  const { addAlertMessages } = useAlertMessages();
  return useCallback(
    response => {
      const errorMessage = response?.data?.message;
      if (errorMessage !== undefined) {
        addAlertMessages([
          {
            color: NotificationColor.ERROR,
            title: errorMessage,
          },
        ]);
      } else if (defaultMessage !== undefined) {
        addAlertMessages([defaultMessage]);
      }
    },
    [addAlertMessages, defaultMessage],
  );
};

export default useErrorResponseHandler;
