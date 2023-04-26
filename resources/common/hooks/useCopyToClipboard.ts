import { useCallback } from 'react';
import { useAlertMessages } from 'stratosphere-ui';

export const useCopyToClipboard = (): ((
  text: string,
  successMessage?: string,
) => void) => {
  const { addAlertMessages } = useAlertMessages();
  return useCallback(async (text, successMessage) => {
    await navigator.clipboard.writeText(text);
    addAlertMessages([
      {
        status: 'success',
        message: successMessage ?? 'Copied to clipboard!',
      },
    ]);
  }, []);
};
