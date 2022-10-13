import { useMutation, UseMutationResult } from '@tanstack/react-query';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useAppContext } from '../../context';
import { REST_API_URL } from '../constants';
import { ErrorResponse } from '../types';
import useErrorResponseHandler from './useErrorResponseHandler';

export interface ForgotPasswordRequest {
  email: string;
}

export const useForgotPasswordMutation = (): UseMutationResult<
  AxiosResponse,
  AxiosError<ErrorResponse>,
  ForgotPasswordRequest
> => {
  const { clearAlertMessages } = useAppContext();
  const onErrorResponse = useErrorResponseHandler();
  return useMutation(
    async data => {
      clearAlertMessages();
      return await axios.post(`${REST_API_URL}/auth/forgot-password`, data);
    },
    {
      onError: ({ response }) => onErrorResponse(response),
    },
  );
};
