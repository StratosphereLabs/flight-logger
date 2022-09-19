import { useMutation, UseMutationResult } from '@tanstack/react-query';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { API_URL } from '../../common/constants';
import { useErrorResponseHandler } from '../../common/hooks';
import { ErrorResponse } from '../../common/types';
import { useAppContext } from '../../context';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export const useLoginMutation = (): UseMutationResult<
  AxiosResponse<LoginResponse>,
  AxiosError<ErrorResponse>,
  LoginRequest
> => {
  const { clearAlertMessages, setToken } = useAppContext();
  const onErrorResponse = useErrorResponseHandler();
  return useMutation(
    async data => {
      clearAlertMessages();
      return await axios.post(`${API_URL}/auth/login`, data);
    },
    {
      onSuccess: ({ data }) => {
        setToken(data.token);
      },
      onError: ({ response }) => onErrorResponse(response),
    },
  );
};
