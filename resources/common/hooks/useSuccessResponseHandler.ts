import { useAlertMessages } from 'stratosphere-ui';

export const useSuccessResponseHandler = (): ((message: string) => void) => {
  const { addAlertMessages } = useAlertMessages();
  return message => {
    addAlertMessages([
      {
        color: 'success',
        title: message,
      },
    ]);
  };
};
