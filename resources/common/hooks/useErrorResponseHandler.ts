import { AxiosResponse } from 'axios';
import { useCallback } from 'react';
import { useAppContext } from '../../providers';
import { AlertMessage, ErrorResponse } from '../types';

export const useErrorResponseHandler = (
  defaultMessage?: AlertMessage,
): ((response?: AxiosResponse<ErrorResponse>) => void) => {
  const { addAlertMessages } = useAppContext();
  return useCallback(
    response => {
      const errorMessage = response?.data?.message;
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
    [defaultMessage],
  );
};

export default useErrorResponseHandler;
