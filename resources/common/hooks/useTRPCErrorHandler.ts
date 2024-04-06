import { NotificationColor } from '@prisma/client';
import { type TRPCClientErrorBase } from '@trpc/client';
import { useCallback } from 'react';
import { type DefaultErrorShape } from '../types';
import { useAlertMessages } from './useAlertMessages';

export const useTRPCErrorHandler = <TShape extends DefaultErrorShape>(): ((
  trpcError?: TRPCClientErrorBase<TShape> | null,
) => void) => {
  const { addAlertMessages } = useAlertMessages();
  return useCallback(
    (trpcError?: TRPCClientErrorBase<TShape> | null) => {
      const errorMessage = trpcError?.shape?.message ?? null;
      const zodError = trpcError?.data?.zodError ?? null;
      if (zodError !== null) {
        addAlertMessages(
          Object.entries(zodError.fieldErrors).flatMap(
            ([field, errors]) =>
              errors?.map(message => ({
                color: NotificationColor.ERROR,
                title: `[${field}]: ${message}`,
              })) ?? [],
          ),
        );
        addAlertMessages(
          zodError.formErrors.map(message => ({
            color: NotificationColor.ERROR,
            title: message,
          })),
        );
      } else if (errorMessage !== null) {
        addAlertMessages([
          {
            color: NotificationColor.ERROR,
            title: errorMessage,
          },
        ]);
      }
    },
    [addAlertMessages],
  );
};
