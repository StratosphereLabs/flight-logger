import { user } from '@prisma/client';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants';

export interface UserResponse
  extends Pick<user, 'username' | 'email' | 'firstName' | 'lastName'> {
  avatar: string;
}

export const useProfileQuery = (
  token: string | null,
): UseQueryResult<UserResponse> =>
  useQuery(
    ['userData', token],
    async () => {
      const response = await axios.get<UserResponse>(
        `${API_URL}/users/profile`,
        {
          headers: {
            Authorization: `Bearer ${token ?? ''}`,
          },
        },
      );
      return response?.data;
    },
    {
      enabled: token !== null,
    },
  );
