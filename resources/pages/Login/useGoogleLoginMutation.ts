import { CredentialResponse as GoogleLoginRequest } from '@react-oauth/google';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { API_URL } from '../../common/constants';
import { useErrorResponseHandler } from '../../common/hooks';
import { ErrorResponse } from '../../common/types';
import { useAppContext } from '../../context';
import { LoginResponse } from './Login';

export const useGoogleLoginMutation = (): UseMutationResult<
  AxiosResponse<LoginResponse>,
  AxiosError<ErrorResponse>,
  GoogleLoginRequest
> => {
  const { setToken } = useAppContext();
  const onErrorResponse = useErrorResponseHandler();
  return useMutation(
    async data => {
      return await axios.post(`${API_URL}/auth/google/callback`, data);
    },
    {
      onSuccess: ({ data }) => {
        setToken(data.token);
      },
      onError: ({ response }) => onErrorResponse(response),
    },
  );
};
