import { AxiosResponse } from 'axios';
import { useCallback } from 'react';
import { AlertMessage, useAlertMessages } from 'stratosphere-ui';
import { ErrorResponse } from '../types';

export const useErrorResponseHandler = (
  defaultMessage?: AlertMessage,
): ((response?: AxiosResponse<ErrorResponse>) => void) => {
  const { addAlertMessages } = useAlertMessages();
  return useCallback(
    response => {
      const errorMessage = response?.data?.message;
      if (errorMessage !== undefined) {
        addAlertMessages([
          {
            color: 'error',
            title: errorMessage,
          },
        ]);
      } else if (defaultMessage !== undefined) {
        addAlertMessages([defaultMessage]);
      }
    },
    [defaultMessage],
  );
};

export default useErrorResponseHandler;
