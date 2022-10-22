import { Maybe } from '@trpc/server';
import { useEffect } from 'react';
import { useAppContext } from '../../providers';
import { DefaultErrorShape } from '../types';

export const useTRPCErrorHandler = <TShape extends DefaultErrorShape>(
  trpcError?: Maybe<TShape['data']> | null,
): void => {
  const { addAlertMessages } = useAppContext();
  useEffect(() => {
    const error = trpcError ?? null;
    const zodError = trpcError?.zodError ?? null;
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
    } else if (error !== null) {
      addAlertMessages([
        {
          status: 'error',
          message: `Error ${error.httpStatus}: ${error.code}`,
        },
      ]);
    }
  }, [trpcError]);
};
