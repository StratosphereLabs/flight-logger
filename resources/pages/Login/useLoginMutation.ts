import { useMutation, UseMutationResult } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import { API_URL } from '../../common/constants';
import { useAppContext } from '../../context';
import { LoginResponse } from './Login';

export interface LoginRequest {
  email: string;
  password: string;
}

export const useLoginMutation = (): UseMutationResult<
  AxiosResponse<LoginResponse>,
  Error,
  LoginRequest
> => {
  const { setToken } = useAppContext();
  return useMutation(
    async data => {
      return await axios.post(`${API_URL}/auth/login`, data);
    },
    {
      onSuccess: ({ data }) => {
        setToken(data.token);
      },
    },
  );
};
