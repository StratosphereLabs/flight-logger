import { user } from '@prisma/client';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants';
import { useAppContext } from '../../context';

export interface UserResponse
  extends Pick<user, 'username' | 'email' | 'firstName' | 'lastName'> {
  avatar: string;
}

export const useUserQuery = (): UseQueryResult<UserResponse> => {
  const { token } = useAppContext();
  return useQuery(
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
};
