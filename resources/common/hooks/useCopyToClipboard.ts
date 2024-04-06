import { useCallback } from 'react';
import { useAlertMessages } from './useAlertMessages';

export const useCopyToClipboard = (): ((
  text: string,
  successMessage?: string,
) => void) => {
  const { addAlertMessages } = useAlertMessages();
  return useCallback(
    async (text, successMessage) => {
      await navigator.clipboard.writeText(text);
      addAlertMessages([
        {
          color: 'SUCCESS',
          title: successMessage ?? 'Copied to clipboard!',
        },
      ]);
    },
    [addAlertMessages],
  );
};
