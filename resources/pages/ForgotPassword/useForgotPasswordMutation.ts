import { useMutation, UseMutationResult } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../../common/constants';
import { ErrorResponse } from '../../common/types';

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  token: string;
}

export const useForgotPasswordMutation = (): UseMutationResult<
  ForgotPasswordResponse,
  ErrorResponse,
  ForgotPasswordRequest
> =>
  useMutation(async data => {
    return await axios.post(`${API_URL}/auth/forgot-password`, data);
  });
