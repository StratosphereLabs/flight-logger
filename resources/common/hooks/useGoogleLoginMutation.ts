import { CredentialResponse as GoogleLoginRequest } from '@react-oauth/google';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { API_URL } from '../constants';
import { useErrorResponseHandler } from '.';
import { ErrorResponse } from '../types';
import { useAppContext } from '../../context';
import { LoginResponse } from './useLoginMutation';

export const useGoogleLoginMutation = (): UseMutationResult<
  AxiosResponse<LoginResponse>,
  AxiosError<ErrorResponse>,
  GoogleLoginRequest
> => {
  const { clearAlertMessages, setToken } = useAppContext();
  const onErrorResponse = useErrorResponseHandler();
  return useMutation(
    async data => {
      clearAlertMessages();
      return await axios.post(`${API_URL}/auth/google/authenticate`, data);
    },
    {
      onSuccess: ({ data }) => {
        setToken(data.token);
      },
      onError: ({ response }) => onErrorResponse(response),
    },
  );
};
