import { type TRPCClientErrorBase } from '@trpc/client';
import { useEffect } from 'react';
import { useAlertMessages } from 'stratosphere-ui';
import { type DefaultErrorShape } from '../types';

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
  }, [trpcError]);
};
