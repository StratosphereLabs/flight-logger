import { type CredentialResponse as GoogleLoginRequest } from '@react-oauth/google';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import axios, { type AxiosError, type AxiosResponse } from 'axios';
import { useAlertMessages } from 'stratosphere-ui';
import { useAuthStore } from '../../stores';
import { REST_API_URL } from '../constants';
import { type ErrorResponse } from '../types';
import { useErrorResponseHandler } from './useErrorResponseHandler';

export interface GoogleLoginResponse {
  token: string;
}

export const useGoogleLoginMutation = (): UseMutationResult<
  AxiosResponse<GoogleLoginResponse>,
  AxiosError<ErrorResponse>,
  GoogleLoginRequest
> => {
  const { clearAlertMessages } = useAlertMessages();
  const { setToken } = useAuthStore();
  const onErrorResponse = useErrorResponseHandler();
  return useMutation(
    async data => {
      clearAlertMessages();
      return await axios.post(`${REST_API_URL}/auth/google/authenticate`, data);
    },
    {
      onSuccess: ({ data }) => {
        setToken(data.token);
      },
      onError: ({ response }) => {
        onErrorResponse(response);
      },
    },
  );
};
