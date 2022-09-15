import { useMutation, UseMutationResult } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../../common/constants';

export const useLogoutMutation = (): UseMutationResult =>
  useMutation(async () => {
    return await axios.post(`${API_URL}/auth/logout`);
  });
