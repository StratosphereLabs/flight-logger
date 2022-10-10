import { airport } from '@prisma/client';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL, HOUR } from '../constants';

export const useAirportsSearchQuery = (
  query: string,
): UseQueryResult<airport[]> =>
  useQuery(
    ['airports', query],
    async () => {
      const response = await axios.get<airport[]>(
        `${API_URL}/airports/search/${query}`,
      );
      return response.data;
    },
    {
      cacheTime: 1 * HOUR,
      enabled: query.length > 0,
      staleTime: 1 * HOUR,
    },
  );
