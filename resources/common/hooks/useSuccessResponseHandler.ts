import { useAppContext } from '../../providers';

export const useSuccessResponseHandler = (): ((message: string) => void) => {
  const { addAlertMessages } = useAppContext();
  return message => {
    addAlertMessages([
      {
        status: 'success',
        message,
      },
    ]);
  };
};
