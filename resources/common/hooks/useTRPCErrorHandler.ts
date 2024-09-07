import { type TRPCClientErrorBase } from '@trpc/client';
import { useCallback } from 'react';
import { useAlertMessages } from 'stratosphere-ui';
import { useAuthStore } from '../../stores';
import { type DefaultErrorShape } from '../types';

export const useTRPCErrorHandler = <TShape extends DefaultErrorShape>(): ((
  trpcError?: TRPCClientErrorBase<TShape> | null,
) => void) => {
  const { logout } = useAuthStore();
  const { addAlertMessages } = useAlertMessages();
  return useCallback(
    (trpcError?: TRPCClientErrorBase<TShape> | null) => {
      if (
        trpcError !== undefined &&
        trpcError !== null &&
        trpcError.message.includes('jwt expired')
      ) {
        logout();
        return;
      }
      const errorMessage = trpcError?.shape?.message ?? null;
      const zodError = trpcError?.data?.zodError ?? null;
      if (zodError !== null) {
        addAlertMessages(
          Object.entries(zodError.fieldErrors).flatMap(
            ([field, errors]) =>
              errors?.map(message => ({
                color: 'error',
                title: `[${field}]: ${message}`,
              })) ?? [],
          ),
        );
        addAlertMessages(
          zodError.formErrors.map(message => ({
            color: 'error',
            title: message,
          })),
        );
      } else if (errorMessage !== null) {
        addAlertMessages([
          {
            color: 'error',
            title: errorMessage,
          },
        ]);
      }
    },
    [addAlertMessages, logout],
  );
};
