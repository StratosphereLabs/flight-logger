import { useMutation, UseMutationResult } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import { API_URL } from '../../common/constants';
import useErrorResponseHandler from '../../common/hooks/useErrorResponseHandler';
import { ErrorResponse } from '../../common/types';
import { useAppContext } from '../../context';
import { LoginResponse } from './Login';

export interface LoginRequest {
  email: string;
  password: string;
}

export const useLoginMutation = (): UseMutationResult<
  AxiosResponse<LoginResponse>,
  ErrorResponse,
  LoginRequest
> => {
  const { setToken } = useAppContext();
  const onErrorResponse = useErrorResponseHandler();
  return useMutation(
    async data => {
      return await axios.post(`${API_URL}/auth/login`, data);
    },
    {
      onSuccess: ({ data }) => {
        setToken(data.token);
      },
      onError: err => onErrorResponse(err),
    },
  );
};
