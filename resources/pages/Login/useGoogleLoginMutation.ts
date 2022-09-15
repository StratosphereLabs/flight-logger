import { user } from '@prisma/client';
import { CredentialResponse } from '@react-oauth/google';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../../common/constants';

export const useGoogleLoginMutation = (): UseMutationResult<
  user,
  Error,
  CredentialResponse
> =>
  useMutation(async data => {
    return await axios.post(`${API_URL}/auth/google/callback`, data);
  });
