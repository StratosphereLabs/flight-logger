import { useMutation, UseMutationResult } from '@tanstack/react-query';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { z } from 'zod';
import { addFlightSchema } from '../../../app/schemas';
import { useAppContext } from '../../providers';
import { REST_API_URL } from '../constants';
import { ErrorResponse } from '../types';
import { useErrorResponseHandler } from './useErrorResponseHandler';

export type AddFlightRequest = z.infer<typeof addFlightSchema>;

export const useAddFlightMutation = (): UseMutationResult<
  AxiosResponse,
  AxiosError<ErrorResponse>,
  AddFlightRequest
> => {
  const { addAlertMessages, clearAlertMessages, token, user } = useAppContext();
  const onErrorResponse = useErrorResponseHandler();
  return useMutation(
    async data => {
      clearAlertMessages();
      return await axios.post(
        `${REST_API_URL}/users/${user?.username ?? ''}/flights`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token ?? ''}`,
          },
        },
      );
    },
    {
      onSuccess: () =>
        addAlertMessages([
          {
            status: 'success',
            message: 'Flight Added!',
          },
        ]),
      onError: ({ response }) => onErrorResponse(response),
    },
  );
};
