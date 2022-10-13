import { useMutation, UseMutationResult } from '@tanstack/react-query';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context';
import { REST_API_URL } from '../constants';
import { ErrorResponse } from '../types';
import useErrorResponseHandler from './useErrorResponseHandler';

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export const useResetPasswordMutation = (): UseMutationResult<
  AxiosResponse,
  AxiosError<ErrorResponse>,
  ResetPasswordRequest
> => {
  const { addAlertMessages, clearAlertMessages } = useAppContext();
  const navigate = useNavigate();
  const onErrorResponse = useErrorResponseHandler();
  return useMutation(
    async data => {
      clearAlertMessages();
      return await axios.post(`${REST_API_URL}/auth/reset-password`, data);
    },
    {
      onSuccess: () => {
        addAlertMessages([
          {
            status: 'success',
            message: 'Password reset successfully. Please login again.',
          },
        ]);
        navigate('/auth/login');
      },
      onError: ({ response }) => onErrorResponse(response),
    },
  );
};
