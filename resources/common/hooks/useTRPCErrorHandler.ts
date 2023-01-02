import { TRPCClientErrorBase } from '@trpc/client';
import { useEffect } from 'react';
import { useAlertMessages } from 'stratosphere-ui';
import { DefaultErrorShape } from '../types';

export const useTRPCErrorHandler = <TShape extends DefaultErrorShape>(
  trpcError?: TRPCClientErrorBase<TShape> | null,
): void => {
  const { addAlertMessages } = useAlertMessages();
  useEffect(() => {
    const errorMessage = trpcError?.shape?.message ?? null;
    const zodError = trpcError?.data?.zodError ?? null;
    if (zodError !== null) {
      addAlertMessages(
        Object.entries(zodError.fieldErrors).flatMap(
          ([field, errors]) =>
            errors?.map(message => ({
              status: 'error',
              message: `[${field}]: ${message}`,
            })) ?? [],
        ),
      );
      addAlertMessages(
        zodError.formErrors.map(message => ({
          status: 'error',
          message,
        })),
      );
    } else if (errorMessage !== null) {
      addAlertMessages([
        {
          status: 'error',
          message: errorMessage,
        },
      ]);
    }
  }, [trpcError]);
};
