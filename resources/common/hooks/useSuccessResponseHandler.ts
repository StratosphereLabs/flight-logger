import { useCallback } from 'react';
import { useAppContext } from '../../providers';

export const useSuccessResponseHandler = (message: string): (() => void) => {
  const { addAlertMessages } = useAppContext();
  return useCallback(() => {
    addAlertMessages([
      {
        status: 'success',
        message,
      },
    ]);
  }, [message]);
};
