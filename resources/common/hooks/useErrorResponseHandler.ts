import { useCallback } from 'react';
import { useAppContext } from '../../context';
import { AlertMessage, ErrorResponse } from '../types';

export const useErrorResponseHandler = (
  defaultMessage?: AlertMessage,
): ((response?: ErrorResponse) => void) => {
  const { addAlertMessages } = useAppContext();
  return useCallback(
    (response?: ErrorResponse) => {
      const errorMessage = response?.message;
      if (errorMessage !== undefined) {
        addAlertMessages([
          {
            status: 'error',
            message: errorMessage,
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
